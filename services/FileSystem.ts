import moment, { Moment } from "moment";
import * as fs from "fs";
import rimraf = require("rimraf");

export interface FileSystemEntry {
    name: string;
    path: string;
    date: Moment;
    size: number;
}

export default class FileSystem {
    public static getFolderContents(path: string): FileSystemEntry[] {
        const entries = fs.readdirSync(path);
    
        return entries.map(f => {
            const filePath = `${path}/${f}`;
    
            return {
                name: f,
                path: filePath,
                date: moment(f.substr(0, 19), "YYYY-MM-DD_HH-mm-ss"),
                size: fs.statSync(filePath).size
            };
        });
    }

    public static deleteFile(file: FileSystemEntry) {
        fs.unlinkSync(file.path);
    }

    public static deleteFolder(path: string) {
        rimraf.sync(path);
    }

    public static exists(path: string) {
        return fs.existsSync(path);
    }

    public static copyFile(file: FileSystemEntry, destinationFolder: string) {
        fs.copyFileSync(file.path, `${destinationFolder}/${file.name}`);
    }
}