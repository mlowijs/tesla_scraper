import Filesystem, { File } from "./Filesystem";

export interface FileUploader {
    uploadFile: (file: File) => boolean;
}

export class FilesystemFileUploader implements FileUploader {
    private readonly folder: string;

    constructor(folder: string) {
        this.folder = folder;
    }

    public uploadFile(file: File) {
        Filesystem.copyFile(file, this.folder);

        return true;
    }
}