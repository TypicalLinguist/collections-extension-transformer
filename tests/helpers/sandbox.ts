import {spawn} from "child-process-promise";
import {mkdirAsync, removeAsync, writeJsonAsync} from "fs-extra-promise";

export {Sandbox}

class Sandbox {
    static path: string;
    static parentDirectoryPath: string;

    static async setup() {
        Sandbox.parentDirectoryPath = process.cwd();
        Sandbox.path = `${process.cwd()}/.sandbox`;
        await mkdirAsync(Sandbox.path);
        process.chdir(Sandbox.path);
        process.on('exit', function () {
            removeAsync(Sandbox.path);
        });

        await Sandbox.createTsConfig();
        await Sandbox.createPackageJsonConfig();
        await Sandbox.installNpmModules();
    }

    static async createTsConfig() {
        await writeJsonAsync(`${Sandbox.path}/tsconfig.json`, {
            moduleResolution: "node",
        })
    }

    static async createPackageJsonConfig() {
        await writeJsonAsync(`${Sandbox.path}/package.json`, {
            name: 'sandbox',
            dependencies: {
                "@types/node": "8.10.17",
                "typescript": "2.8.3"
            }
        })
    }

    static async installNpmModules() {
        await spawn('npm', ['install'], {
            shell: '/usr/bin/fish'
        });

        await spawn('npm', ['link', '@typical-linguist/collections-extension'], {
            shell: '/usr/bin/fish'
        });
    }

    static async tearDown() {
        process.chdir(Sandbox.parentDirectoryPath);
        await removeAsync(Sandbox.path);
    }
}