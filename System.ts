import { spawnSync } from "child_process";
import { Logger } from "pino";

export default class System {
    private readonly logger: Logger;
    private readonly mountPaths: string[];

    constructor(logger: Logger, mountPaths: string[]) {
        this.logger = logger;
        this.mountPaths = mountPaths;
    }

    public unmountDevices() {
        for (const path of [...this.mountPaths].reverse()) {
            this.logger.debug("Unmounting '%s'", path);

            spawnSync("umount", [path]);
        }
    }

    public mountDevices() {
        for (const path of this.mountPaths) {
            this.logger.debug("Mounting '%s'", path);

            if (spawnSync("mount", [path]).error)
                return false;
        }

        return true;
    }

    public reloadMassStorage() {
        this.logger.debug("Reloading mass storage");

        spawnSync("sudo", ["modprobe", "-r", "g_mass_storage"]);
        spawnSync("sudo", ["modprobe", "g_mass_storage"]);
    }
}