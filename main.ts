import System from "./System";
import { FilesystemFileUploader } from "./FileUploader";
import getSettings from "./Settings";
import ClipProcessor from "./ClipProcessor";
import pino from "pino";

const settings = getSettings();
const logger = pino();

const system = new System([settings.usbMountFolder, settings.nfsFileDestinationPath!]);
const fileUploader = new FilesystemFileUploader(settings.nfsFileDestinationPath!);
const clipProcessor = new ClipProcessor(logger, settings, fileUploader);

function main() {
    logger.info("Starting");
    let didProcess = false;

    system.unmountDevices();

    try {
        if (!system.mountDevices()) {
            logger.fatal("Could not mount devices");
            return;
        }

        didProcess = clipProcessor.processSavedClips() || clipProcessor.processRecentClips();

        logger.info("Completed");
    } catch (e) {
        logger.error(e.message);
    } finally {
        system.unmountDevices();

        if (didProcess)
            system.reloadMassStorage();
    }
}

main();