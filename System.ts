import { spawnSync } from "child_process";

export default class System {
    private mountPaths: string[];

    constructor(mountPaths: string[]) {
        this.mountPaths = mountPaths;
    }

    public unmountDevices() {
        for (const path of this.mountPaths.reverse())
            spawnSync("umount", [path]);
    }

    public mountDevices() {
        for (const path of this.mountPaths) {
            if (spawnSync("mount", [path]).error)
                return false;
        }

        return true;
    }

    public reloadMassStorage() {
        spawnSync("sudo", ["modprobe", "-r", "g_mass_storage"]);
        spawnSync("sudo", ["modprobe", "g_mass_storage"]);
    }
}