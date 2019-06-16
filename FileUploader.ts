import { File } from "./Filesystem";
import * as fs from "fs";

export interface FileUploader {
    uploadFile: (file: File) => Boolean;
}

export class FilesystemFileUploader implements FileUploader {
    private folder: string;

    constructor(folder: string) {
        this.folder = folder;
    }

    public uploadFile(file: File) {
        fs.copyFileSync(file.path, `${this.folder}/${file.name}`);

        return true;
    }
}