import { spawnSync } from "child_process";
import { Logger } from "pino";

export default class System {
    private readonly logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    public unmountDevices(...paths: string[]) {
        for (const path of paths) {
            this.logger.debug("Unmounting '%s'", path);
            spawnSync("umount", [path]);
        }
    }

    public mountDevices(...paths: string[]) {
        for (const path of paths) {
            this.logger.debug("Mounting '%s'", path);

            if (spawnSync("mount", [path]).error)
                throw Error(`Could not mount '${path}'`);
        }
    }

    public reloadMassStorage() {
        this.logger.debug("Reloading mass storage");

        if (spawnSync("sudo", ["modprobe", "-r", "g_mass_storage"]).error)
            throw Error(`Could not remove mass storage module`);

        if (spawnSync("sudo", ["modprobe", "g_mass_storage"]).error)
            throw Error(`Could not load mass storage module`);
    }
}