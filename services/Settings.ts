import * as fs from "fs";
import * as YAML from "yaml";

const SETTINGS_FILE_NAME = "settings.yml";

export interface Settings {
    [key: string]: any;

    logLevel: string;
    usbMountFolder: string;
    archiveFolder: string;
    processDelayMinutes: number;
}

export default function getSettings(): Settings {
    const data = fs.readFileSync(SETTINGS_FILE_NAME, "utf8");

    return YAML.parse(data) as Settings;
}