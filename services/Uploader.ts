import { Logger } from "pino";
import { Settings } from "./Settings";
import { FileUploader } from "./FileUploader";
import FileSystem from "./FileSystem";

export default class Uploader {
    private readonly logger: Logger;
    private readonly settings: Settings;
    private readonly fileUploader: FileUploader;

    constructor(logger: Logger, settings: Settings, fileUploader: FileUploader) {
        this.logger = logger;
        this.settings = settings;
        this.fileUploader = fileUploader;
    }

    public upload() {
        const { logger, fileUploader, settings } = this;

        try {
            logger.info("Starting upload archived clips");

            const files = FileSystem.getFolderContents(settings.archiveFolder);

            if (files.length === 0)
                logger.info("No archived clips found");
            else
                fileUploader.uploadFiles(files);

            logger.info("Upload archived clips completed");
        } catch (e) {
            logger.fatal(e.message);
        }
    }
}