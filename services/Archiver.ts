import System from "./System";
import { Logger } from "pino";
import { Settings } from "./Settings";
import FileSystem from "./FileSystem";
import { TESLA_CAM, RECENT_CLIPS } from "../Constants";
import moment from "moment";

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
        let success = false;

        logger.info("Starting archive");

        system.unmountDevices(settings.usbMountFolder);
    
        try {
            system.mountDevices(settings.usbMountFolder);

            this.archiveRecentClips();
            success = true;

            logger.info("Archive completed");
        } catch (e) {
            logger.fatal(e.message);
        } finally {
            system.unmountDevices(settings.usbMountFolder);

            if (success)
                system.reloadMassStorage();
        }
    }

    private archiveRecentClips() {
        const { logger, settings } = this;

        const recentClipsPath = `${settings.usbMountFolder}/${TESLA_CAM}/${RECENT_CLIPS}`;

        const now = moment();
        const files = FileSystem.getFolderContents(recentClipsPath)
            .filter(f => moment.duration(now.diff(f.date)).asMinutes() >= settings.processDelayMinutes);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            logger.info("Archiving file '%s' (%d/%d)", file.name, i + 1, files.length);

            FileSystem.copyFile(file, settings.archiveFolder);
            FileSystem.deleteFile(file);
        }
    }
}