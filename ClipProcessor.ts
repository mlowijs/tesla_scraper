// import { Settings, ArchiveMode } from "./Settings";
// import { Logger } from "pino";
// import Filesystem, { File } from "./Filesystem";
// import moment from "moment";
// import { FileUploader } from "./FileUploader";
// import { SAVED_CLIPS, RECENT_CLIPS } from "./Constants";

// export default class ClipProcessor {
//     private readonly logger: Logger;
//     private readonly settings: Settings;
//     private readonly fileUploader: FileUploader;
//     private readonly teslacamFolder: string;

//     constructor(logger: Logger, settings: Settings, fileUploader: FileUploader) {
//         this.logger = logger;
//         this.settings = settings;
//         this.fileUploader = fileUploader;

//         this.teslacamFolder = `${settings.usbMountFolder}/TeslaCam`;
//     }

//     public processSavedClips(): boolean {
//         if (this.settings.savedClipsArchiveMode === ArchiveMode.SKIP) {
//             this.logger.info("Skipping saved clips");
//             return false;
//         }
        
//         const path = `${this.teslacamFolder}/${SAVED_CLIPS}`;

//         if (!Filesystem.exists(path)) {
//             this.logger.info("No saved clips found");
//             return false;
//         }
    
//         const now = moment();
//         const savedClipsFolders = Filesystem.getFolderContents(path)
//             .filter(f => moment.duration(now.diff(f.date)).asMinutes() >= this.settings.processDelayMinutes);
    
//         if (savedClipsFolders.length === 0) {
//             this.logger.info("No saved clips found");
//             return false;
//         }
    
//         this.logger.info("Processing saved clips");
    
//         for (const folder of savedClipsFolders)
//             this.processSavedClipsFolder(folder);
    
//         this.logger.info("Processed saved clips");
//         return true;
//     }

//     private processSavedClipsFolder(folder: File) {
//         if (this.settings.savedClipsArchiveMode === ArchiveMode.DELETE) {
//             this.logger.info("Deleting folder '%s'", folder.name);

//             Filesystem.deleteFolder(folder.path);
//         }

//         this.logger.info("Processing folder '%s'", folder.name);
    
//         const filesInFolder = Filesystem.getFolderContents(folder.path);
    
//         for (let i = 0; i < filesInFolder.length; i++) {
//             const file = filesInFolder[i];
    
//             this.logger.info("Copying file %d/%d", i + 1, filesInFolder.length);
//             this.processFile(file);
//         }
    
//         Filesystem.deleteFolder(folder.path);
    
//         this.logger.info("Processed folder '%s'", folder.name);
//     }
// }