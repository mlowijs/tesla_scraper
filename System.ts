import { spawnSync } from "child_process";
import { Logger } from "pino";

export default class System {
    private readonly logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    public unmountDevice(path: string) {
        this.logger.debug("Unmounting '%s'", path);
        spawnSync("umount", [path]);
    }

    public mountDevice(path: string) {
        this.logger.debug("Mounting '%s'", path);

        if (spawnSync("mount", [path]).error)
            throw Error(`Could not mount '${path}'`);
    }

    public reloadMassStorage() {
        this.logger.debug("Reloading mass storage");

        spawnSync("sudo", ["modprobe", "-r", "g_mass_storage"]);
        spawnSync("sudo", ["modprobe", "g_mass_storage"]);
    }
}