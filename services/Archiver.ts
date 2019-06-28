import System from "./System";
import { Logger } from "pino";
import { Settings } from "./Settings";
import FileSystem, { FileSystemEntry } from "./FileSystem";
import { TESLA_CAM, RECENT_CLIPS, SAVED_CLIPS } from "../Constants";

const ONE_MEGABYTE = 1024 * 1024;

export default class Archiver {
    private readonly logger: Logger;
    private readonly settings: Settings;
    private readonly system: System;

    constructor(logger: Logger, settings: Settings, system: System) {
        this.logger = logger;
        this.settings = settings;
        this.system = system;
    }

    public archive() {
        const { logger, settings, system } = this;

        logger.info("Starting archive");

        system.unmountDevices(settings.usbMountFolder);

        try {
            system.mountDevices(settings.usbMountFolder);

            this.archiveRecentClips();
            this.archiveSavedClips();

            logger.info("Archive completed");
        } catch (e) {
            logger.fatal(e.message);
        } finally {
            try {
                system.unmountDevices(settings.usbMountFolder);
            } catch (e) {
                logger.error(e.message);
            }
        }
    }

    private archiveRecentClips() {
        const { logger, settings } = this;

        const recentClipsPath = `${settings.usbMountFolder}/${TESLA_CAM}/${RECENT_CLIPS}`;

        if (!FileSystem.exists(recentClipsPath)) {
            logger.info("No recent clips found");
            return;
        }

        const files = FileSystem.getFolderContents(recentClipsPath);

        if (files.length === 0) {
            logger.info("No recent clips found");
            return;
        }

        this.archiveClips(files);
    }

    private archiveSavedClips() {
        const { logger, settings } = this;

        const savedClipsPath = `${settings.usbMountFolder}/${TESLA_CAM}/${SAVED_CLIPS}`;

        if (!FileSystem.exists(savedClipsPath)) {
            logger.info("No saved clips found");
            return;
        }

        const folders = FileSystem.getFolderContents(savedClipsPath);

        if (folders.length === 0) {
            logger.info("No saved clips found");
            return;
        }

        for (let i = 0; i < folders.length; i++) {
            const folder = folders[i];

            logger.info("Archiving saved clips folder '%s' (%d/%d)", folder.name, i + 1, folders.length);

            this.archiveSavedClipsFolder(folder);
        }
    }

    private archiveSavedClipsFolder(folder: FileSystemEntry) {
        const { logger, settings } = this;

        const files = FileSystem.getFolderContents(folder.path);

        if (files.length === 0) {
            logger.info("Saved clips folder is empty");
            return;
        }

        this.archiveClips(files);

        FileSystem.deleteFolder(folder.path);
    }

    private archiveClips(files: FileSystemEntry[]) {
        const { logger, settings } = this;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            logger.info("Archiving clip '%s' (%d/%d)", file.name, i + 1, files.length);

            if (file.size >= ONE_MEGABYTE)
                FileSystem.copyFile(file, settings.archiveFolder);

            FileSystem.deleteFile(file);
        }
    }
}