import { Logger } from "pino";
import { Settings } from "./Settings";
import System from "./System";
import { FileUploader } from "./FileUploader";
import FileSystem, { File } from "./FileSystem";
import { TESLA_CAM, SAVED_CLIPS } from "../Constants";

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
        const { logger, settings } = this;

        logger.info("Starting upload saved clips");

        const path = `${settings.usbMountFolder}/${TESLA_CAM}/${SAVED_CLIPS}`;
        const savedClipsFolders = FileSystem.getFolderContents(path);

        for (let i = 0; i < savedClipsFolders.length; i++) {
            const folder = savedClipsFolders[i];

            logger.info("Uploading folder '%s' (%d/%d)", folder.name, i + 1, savedClipsFolders.length);

            this.uploadSavedClipsFolder(folder);
        }

        logger.info("Upload saved clips completed");
    }

    private uploadSavedClipsFolder(folder: File) {
        const { fileUploader } = this;

        const files = FileSystem.getFolderContents(folder.path);
        fileUploader.uploadFiles(files);
    }

    private uploadArchivedClips() {
        const { logger, fileUploader, settings } = this;

        logger.info("Starting upload archived clips");

        const files = FileSystem.getFolderContents(settings.archiveFolder);
        fileUploader.uploadFiles(files);

        logger.info("Upload archived clips completed");
    }
}