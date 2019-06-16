import * as fs from "fs";
import * as YAML from "yaml";

export interface Settings {
    usbMountFolder: string;
    processDelayMinutes: number;
    savedClipsArchiveMode: ArchiveMode;
    recentClipsArchiveMode: ArchiveMode;
    
    nfsFileDestinationPath?: string;
}

export enum ArchiveMode {
    DELETE = "delete",
    SKIP = "skip",
    UPLOAD = "upload"
}

export default function getSettings(): Settings {
    const data = fs.readFileSync("settings.yml", "utf8");

    return YAML.parse(data) as Settings;
}