import { File } from "./FileSystem";

export interface FileUploader {
    uploadFiles: (files: File[]) => void;
}