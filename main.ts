import System from "./System";
import { FilesystemFileUploader } from "./FileUploader";
import getSettings from "./Settings";
import ClipProcessor from "./ClipProcessor";
import pino from "pino";
import * as yargs from "yargs";
import Archiver from "./Archiver";
import Uploader from "./Uploader";

const argv = yargs.command("archive", "Archive recent clips.")
    .command("upload", "Upload clips.")
    .help()
    .argv;

const settings = getSettings();
const logger = pino({
    level: settings.logLevel
});

const system = new System(logger);

const archiver = new Archiver(logger, system);
const uploader = new Uploader();

function main() {
    if (argv.archive) {
        archiver.archive();
    } else if (argv.upload) {
        uploader.upload();
    } else {
        logger.error("Unknown command.");
    }
}

// function main() {
    

//     logger.info("Starting");
//     let didProcess = false;

//     system.unmountDevices();

//     try {
//         system.mountDevices();

//         didProcess = clipProcessor.processSavedClips() || clipProcessor.processRecentClips();

//         logger.info("Completed");
//     } catch (e) {
//         logger.fatal(e.message);
//     } finally {
//         system.unmountDevices();

//         if (didProcess)
//             system.reloadMassStorage();
//     }
// }

main();