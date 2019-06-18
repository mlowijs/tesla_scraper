import { FileUploader } from "../services/FileUploader";
import { Settings } from "../services/Settings";
import FileSystem from "../services/FileSystem";
import { FileSystemEntry } from "../services/FileSystem";
import System from "../services/System";
import { Logger } from "pino";

interface FileSystemFileUploaderSettings {
    path: string;
    requiresMount: boolean;
}

export default class FileSystemFileUploader implements FileUploader {
    private readonly logger: Logger;
    private readonly settings: FileSystemFileUploaderSettings;
    private readonly system: System;

    constructor(logger: Logger, settings: Settings, system: System) {
        this.logger = logger;
        this.settings = settings.filesystemFileUploader as FileSystemFileUploaderSettings;
        this.system = system;
    }

    public uploadFiles(files: FileSystemEntry[]) {
        const { logger, settings, system } = this;

        try {
            if (settings.requiresMount) {
                system.unmountDevices(settings.path);
                system.mountDevices(settings.path);
            }
        } catch (e) {
            logger.error("Mounting file share failed");
            return;
        } finally {
            system.unmountDevices(settings.path);
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            logger.info("Copying file '%s' (%d/%d)", file.name, i + 1, files.length);

            try {
                FileSystem.copyFile(file, settings.path);
            } catch (e) {
                logger.error("Failed to copy file '%s'", file.name);
            }
        }            

        if (settings.requiresMount)
            system.unmountDevices(settings.path);
    }
}