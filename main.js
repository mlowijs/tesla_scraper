const USB_DEVICE_PATH = "/usbfs";
const USB_MOUNT_FOLDER = "/mnt/usbfs";
const AZURE_STORAGE_ACCOUNT_NAME = "mlcloudshell";
const AZURE_STORAGE_ACCESS_KEY = "klT6UHqrz+7IFpNmuPgx5j0J3CDt6Loz9AGVp2TZk1qAMktIPf6qF6cWpO2m8wNwcGG5bGAyMfY7iuKwLaOQZA==";
const AZURE_STORAGE_CONTAINER_NAME = "teslacam";
const FILE_DESTINATION_PATH = "/mnt/nfs";

const UPLOAD_SAVED_CLIPS = true;
const UPLOAD_RECENT_CLIPS = true;

/*******************/
/* CODE GOES BELOW */
/*******************/

const { execSync, spawnSync } = require("child_process");
const moment = require("moment");
const fs = require("fs");
const rimraf = require("rimraf");
const { terminal } = require("terminal-kit");

const TESLACAM_FOLDER = `${USB_MOUNT_FOLDER}/TeslaCam`;
const SAVED_CLIPS = "SavedClips";
const RECENT_CLIPS = "RecentClips";
const UPLOAD_DELAY_MINUTES = 5;

(async function () {
    log("Starting");

    unmountDevices();

    try {
        mountDevices();

        await processSavedClips();
        await processRecentClips();
    } finally {
        unmountDevices();
        reloadMassStorage();

        log("Completed");
    }
})();

async function processFile(file) {
    fs.copyFileSync(file.path, `${FILE_DESTINATION_PATH}/${file.name}`);
    progressLogger({ loadedBytes: file.size });

    fs.unlinkSync(file.path);
}

async function processFolder(folder) {
    terminal("Copying folder ").green(folder.name)("\n");

    const filesInFolder = getFolderContents(folder.path);

    for (let i = 0; i < filesInFolder.length; i++) {
        const file = filesInFolder[i];

        terminal("Copying file ").green(`${i + 1}/${filesInFolder.length}`)("\n");
        processFile(file);
    }

    rimraf.sync(folder.path);

    terminal("Copied folder ").green(folder.name)("\n");
}

async function processRecentClips() {
    if (!UPLOAD_RECENT_CLIPS)
        return;

    const path = `${TESLACAM_FOLDER}/${RECENT_CLIPS}`;

    if (!fs.existsSync(path))
        return;

    const now = moment();
    const recentClips = getFolderContents(path)
        .filter(f => moment.duration(now.diff(f.date)).asMinutes() >= UPLOAD_DELAY_MINUTES);

    terminal("Processing ").green("recent")(" clips\n");

    for (let i = 0; i < recentClips.length; i++) {
        const file = recentClips[i];

        terminal("Copying file ").green(`${i + 1}/${recentClips.length}`)("\n");
        processFile(file);
    }

    terminal("Processed ").green("recent")(" clips\n");
}

async function processSavedClips() {
    if (!UPLOAD_SAVED_CLIPS)
        return;

    const path = `${TESLACAM_FOLDER}/${SAVED_CLIPS}`;

    if (!fs.existsSync(path))
        return;

    const now = moment();
    const savedClipsFolders = getFolderContents(path)
        .filter(f => moment.duration(now.diff(f.date)).asMinutes() >= UPLOAD_DELAY_MINUTES);

    terminal("Processing ").green("saved")(" clips\n");

    for (const folder of savedClipsFolders)
        await processFolder(folder);

    terminal("Processed ").green("saved")(" clips\n");
}

function getAzureBlobContainerUrl() {
    const credentials = new SharedKeyCredential(AZURE_STORAGE_ACCOUNT_NAME, AZURE_STORAGE_ACCESS_KEY);
    const pipeline = StorageURL.newPipeline(credentials);
    const serviceUrl = new ServiceURL(`https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`, pipeline);

    return ContainerURL.fromServiceURL(serviceUrl, AZURE_STORAGE_CONTAINER_NAME);
}

function getFolderContents(path) {
    const entries = fs.readdirSync(path);
    return entries.map(f => {
        const filePath = `${path}/${f}`;

        return {
            name: f,
            path: filePath,
            date: moment(f.substr(0, 19), "YYYY-MM-DD_HH-mm-ss"),
            size: fs.statSync(filePath).size
        };
    });
}

function unmountDevices() {
    spawnSync("umount", [FILE_DESTINATION_PATH]);
    spawnSync("umount", [USB_DEVICE_PATH]);
}

function mountDevices() {
    spawnSync("mount", [USB_DEVICE_PATH]);
    spawnSync("mount", [FILE_DESTINATION_PATH]);
}

function reloadMassStorage() {
    execSync(`sudo modprobe -r g_mass_storage`);
    execSync(`sudo modprobe g_mass_storage`);
}

function log(text) {
    terminal(text + "\n");
}