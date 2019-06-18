import { FileSystemEntry } from "./FileSystem";

export interface FileUploader {
    uploadFiles: (files: FileSystemEntry[]) => void;
}