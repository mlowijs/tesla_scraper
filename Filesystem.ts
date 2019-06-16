import moment, { Moment } from "moment";
import * as fs from "fs";

export interface File {
    name: string;
    path: string;
    date: Moment;
    size: number;
}

export default class Filesystem {
    public static getFolderContents(path: string): File[] {
        const entries = fs.readdirSync(path);
    
        return entries.filter(f => f.endsWith(".mp4")).map(f => {
            const filePath = `${path}/${f}`;
    
            return {
                name: f,
                path: filePath,
                date: moment(f.substr(0, 19), "YYYY-MM-DD_HH-mm-ss"),
                size: fs.statSync(filePath).size
            };
        });
    }

    public static deleteFile(file: File) {
        fs.unlinkSync(file.path);
    }

    public static exists(path: string) {
        return fs.existsSync(path);
    }
}