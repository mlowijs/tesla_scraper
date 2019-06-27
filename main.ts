import System from "./services/System";
import getSettings from "./services/Settings";
import pino from "pino";
import * as yargs from "yargs";
import Archiver from "./services/Archiver";
import Uploader from "./services/Uploader";
import FileSystemFileUploader from "./fileUploaders/FileSystemFileUploader";

const argv = yargs.command("archive", "Archive recent clips.")
    .command("upload", "Upload clips.")
    .demandCommand(1, 1)
    .scriptName("main.ts")
    .strict()
    .help()
    .argv;

const settings = getSettings();
const logger = pino({
    level: settings.logLevel
});

const system = new System(logger);
const filesystemFileUploader = new FileSystemFileUploader(logger, settings, system);

const archiver = new Archiver(logger, settings, system);
const uploader = new Uploader(logger, settings, filesystemFileUploader);

function main() {
    logger.info("Starting TeslaScraper");

    if (argv._.includes("archive")) {
        archiver.archive();
    } else if (argv._.includes("upload")) {
        uploader.upload();
    }
}

main();