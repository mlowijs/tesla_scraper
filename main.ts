import System from "./System";
import { FilesystemFileUploader } from "./FileUploader";
import getSettings from "./Settings";
import ClipProcessor from "./ClipProcessor";
import pino from "pino";

const settings = getSettings();
const logger = pino({
    level: settings.logLevel
});

const fileUploader = new FilesystemFileUploader(settings.mountPaths[0]);
const system = new System(logger, [settings.usbMountFolder, ...settings.mountPaths]);
const clipProcessor = new ClipProcessor(logger, settings, fileUploader);

function main() {
    logger.info("Starting");
    let didProcess = false;

    system.unmountDevices();

    try {
        system.mountDevices();

        didProcess = clipProcessor.processSavedClips() || clipProcessor.processRecentClips();

        logger.info("Completed");
    } catch (e) {
        logger.fatal(e.message);
    } finally {
        system.unmountDevices();

        if (didProcess)
            system.reloadMassStorage();
    }
}

main();