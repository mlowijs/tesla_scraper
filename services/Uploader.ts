import { Logger } from "pino";
import { Settings } from "./Settings";
import System from "./System";
import { FileUploader } from "./FileUploader";
import FileSystem, { FileSystemEntry } from "./FileSystem";

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

        try {
            this.uploadArchivedClips();
            
            success = true;

            logger.info("Upload completed");
        } catch (e) {
            logger.fatal(e.message);
        } finally {
            try {
                system.unmountDevices(settings.usbMountFolder);

                if (success)
                    system.reloadMassStorage();
            } catch (e) {
                logger.error(e.message);
            }
        }
    }

    private uploadArchivedClips() {
        const { logger, fileUploader, settings } = this;

        logger.info("Starting upload archived clips");

        const files = FileSystem.getFolderContents(settings.archiveFolder);
        fileUploader.uploadFiles(files);

        logger.info("Upload archived clips completed");
    }
}