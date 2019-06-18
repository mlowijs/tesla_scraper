import { Logger } from "pino";
import { Settings } from "./Settings";
import System from "./System";
import { FileUploader } from "./FileUploader";
import FileSystem from "./FileSystem";

export default class Uploader {
    private readonly logger: Logger;
    private readonly settings: Settings;
    private readonly system: System;
    private readonly fileUploader: FileUploader;

    constructor(logger: Logger, settings: Settings, system: System, fileUploader: FileUploader) {
        this.logger = logger;
        this.settings = settings;
        this.system = system;
        this.fileUploader = fileUploader;
    }

    public upload() {
        const { logger, settings, system } = this;
        let success = false;

        logger.info("Starting upload");

        system.unmountDevices(settings.usbMountFolder);

        try {
            this.uploadArchivedClips();

            system.mountDevices(settings.usbMountFolder);
            this.uploadSavedClips();
            
            success = true;

            logger.info("Upload completed");
        } catch (e) {
            logger.fatal(e.message);
        } finally {
            system.unmountDevices(settings.usbMountFolder);

            if (success)
                system.reloadMassStorage();
        }
    }

    private uploadSavedClips() {

    }

    private uploadArchivedClips() {
        const { logger, fileUploader, settings } = this;

        logger.info("Starting upload archived clips");

        const files = FileSystem.getFolderContents(settings.archiveFolder);
        fileUploader.uploadFiles(files);

        logger.info("Upload archived clips completed");
    }
}