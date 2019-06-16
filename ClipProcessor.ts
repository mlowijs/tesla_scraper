import { Settings, ArchiveMode } from "./Settings";
import { Logger } from "pino";
import Filesystem, { File } from "./Filesystem";
import moment = require("moment");
import { FileUploader } from "./FileUploader";

const SAVED_CLIPS = "SavedClips";
const RECENT_CLIPS = "RecentClips";

export default class ClipProcessor {
    private readonly logger: Logger;
    private readonly settings: Settings;
    private readonly fileUploader: FileUploader;
    private readonly teslacamFolder: string;

    constructor(logger: Logger, settings: Settings, fileUploader: FileUploader) {
        this.logger = logger;
        this.settings = settings;
        this.fileUploader = fileUploader;

        this.teslacamFolder = `${settings.usbMountFolder}/TeslaCam`;
    }

    public processSavedClips(): boolean {
        if (this.settings.savedClipsArchiveMode === ArchiveMode.SKIP) {
            this.logger.info("Skipping saved clips");
            return false;
        }
        
        const path = `${this.teslacamFolder}/${SAVED_CLIPS}`;

        if (!Filesystem.exists(path)) {
            this.logger.info("No saved clips found");
            return false;
        }
    
        const now = moment();
        const savedClipsFolders = Filesystem.getFolderContents(path)
            .filter(f => moment.duration(now.diff(f.date)).asMinutes() >= this.settings.processDelayMinutes);
    
        if (savedClipsFolders.length === 0) {
            this.logger.info("No saved clips found");
            return false;
        }
    
        this.logger.info("Processing saved clips");
    
        for (const folder of savedClipsFolders)
            this.processSavedClipsFolder(folder);
    
        this.logger.info("Processed saved clips");
        return true;
    }

    public processRecentClips(): boolean {
        if (this.settings.recentClipsArchiveMode === ArchiveMode.SKIP) {
            this.logger.info("Skipping recent clips");
            return false;
        }

        const path = `${this.teslacamFolder}/${RECENT_CLIPS}`;

        if (this.settings.recentClipsArchiveMode === ArchiveMode.DELETE) {
            this.logger.info("Deleting recent clips");

            Filesystem.deleteFolder(path);
            return true;
        }
    
        if (!Filesystem.exists(path)) {
            this.logger.info("No recent clips found");
            return false;
        }
    
        const now = moment();
        const recentClips = Filesystem.getFolderContents(path)
            .filter(f => moment.duration(now.diff(f.date)).asMinutes() >= this.settings.processDelayMinutes);
    
        if (recentClips.length === 0) {
            this.logger.info("No recent clips found");
            return false;
        }
    
        this.logger.info("Processing recent clips");
    
        for (let i = 0; i < recentClips.length; i++) {
            const file = recentClips[i];
    
            this.logger.info("Copying file %d/%d", i + 1, recentClips.length);
            this.processFile(file);
        }
    
        this.logger.info("Processed recent clips");
        return true;
    }

    private processSavedClipsFolder(folder: File) {
        if (this.settings.savedClipsArchiveMode === ArchiveMode.DELETE) {
            this.logger.info("Deleting folder '%s'", folder.name);

            Filesystem.deleteFolder(folder.path);
        }

        this.logger.info("Processing folder '%s'", folder.name);
    
        const filesInFolder = Filesystem.getFolderContents(folder.path);
    
        for (let i = 0; i < filesInFolder.length; i++) {
            const file = filesInFolder[i];
    
            this.logger.info("Copying file %d/%d", i + 1, filesInFolder.length);
            this.processFile(file);
        }
    
        Filesystem.deleteFolder(folder.path);
    
        this.logger.info("Processed folder '%s'", folder.name);
    }

    private async processFile(file: File) {
        this.fileUploader.uploadFile(file);
        
        Filesystem.deleteFile(file);
    }
}