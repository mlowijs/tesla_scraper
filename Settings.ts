import * as fs from "fs";
import * as YAML from "yaml";

const SETTINGS_FILE_NAME = "settings.yml";

export interface Settings {
    logLevel: string;
    usbMountFolder: string;
    archiveFolder: string;
    processDelayMinutes: number;
    savedClipsArchiveMode: ArchiveMode;
    recentClipsArchiveMode: ArchiveMode;
    mountPaths: string[];
}

export enum ArchiveMode {
    DELETE = "delete",
    SKIP = "skip",
    UPLOAD = "upload"
}

export default function getSettings(): Settings {
    const data = fs.readFileSync(SETTINGS_FILE_NAME, "utf8");

    return YAML.parse(data) as Settings;
}