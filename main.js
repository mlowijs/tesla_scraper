const USB_DEVICE_PATH = "/usbfs";
const USB_MOUNT_FOLDER = "/mnt/usbfs";
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
const logger = require("pino")();

const TESLACAM_FOLDER = `${USB_MOUNT_FOLDER}/TeslaCam`;
const SAVED_CLIPS = "SavedClips";
const RECENT_CLIPS = "RecentClips";
const UPLOAD_DELAY_MINUTES = 5;

(async function () {
    logger.info("Starting");

    unmountDevices();

    try {
        if (!mountDevices()) {
            logger.fatal("Could not mount devices");
            return;
        }

        await processSavedClips();
        await processRecentClips();

        logger.info("Completed");
    } catch (e) {
        logger.error(e.message);
    } finally {
        unmountDevices();
        reloadMassStorage();
    }
})();

async function processFile(file) {
    fs.copyFileSync(file.path, `${FILE_DESTINATION_PATH}/${file.name}`);
    progressLogger({ loadedBytes: file.size });

    fs.unlinkSync(file.path);
}

async function processFolder(folder) {
    logger.info("Processing folder '%s'", folder.name);

    const filesInFolder = getFolderContents(folder.path);

    for (let i = 0; i < filesInFolder.length; i++) {
        const file = filesInFolder[i];

        logger.info("Copying file %d/%d", i + 1, filesInFolder.length);
        processFile(file);
    }

    rimraf.sync(folder.path);

    logger.info("Processed folder '%s'", folder.name);
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

        logger.info("Processing recent clips");

    for (let i = 0; i < recentClips.length; i++) {
        const file = recentClips[i];

        logger.info("Copying file %d/%d", i + 1, recentClips.length);
        processFile(file);
    }

    logger.info("Processed recent clips");
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

    logger.info("Processing saved clips");

    for (const folder of savedClipsFolders)
        await processFolder(folder);

    logger.info("Processed saved clips");
}

function getFolderContents(path) {
    const entries = fs.readdirSync(path);
    
    return entries.filter(f => f.endsWith(".mp4")).map(f => {
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
    if (spawnSync("mount", [USB_DEVICE_PATH]).error)
        return false;

    if (spawnSync("mount", [FILE_DESTINATION_PATH]).error)
        return false;

    return true;
}

function reloadMassStorage() {
    execSync(`sudo modprobe -r g_mass_storage`);
    execSync(`sudo modprobe g_mass_storage`);
}