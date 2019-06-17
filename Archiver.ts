import System from "./System";
import { Logger } from "pino";
import { Settings } from "./Settings";
import Filesystem from "./Filesystem";
import { TESLA_CAM, RECENT_CLIPS } from "./Constants";
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

        logger.info("Starting archive");

        system.unmountDevice(settings.usbMountFolder);
    
        try {
            system.mountDevice(settings.usbMountFolder);

            this.archiveRecentClips();
            this.system.reloadMassStorage();

            this.logger.info("Archive completed");
        } catch (e) {
            logger.fatal(e.message);
        } finally {
            system.unmountDevice(settings.usbMountFolder);
        }
    }

    private archiveRecentClips() {
        const { settings } = this;

        const recentClipsPath = `${settings.usbMountFolder}/${TESLA_CAM}/${RECENT_CLIPS}`;

        const now = moment();
        const files = Filesystem.getFolderContents(recentClipsPath)
            .filter(f => moment.duration(now.diff(f.date)).asMinutes() >= settings.processDelayMinutes);

        for (const file of files) {
            Filesystem.copyFile(file, settings.archiveFolder);
            Filesystem.deleteFile(file);
        }
    }
}