import {spawn} from "child-process-promise";
import {CompilerOptions, Program} from "ts-simple-ast";
import recursiveReadDir = require("recursive-readdir");

export class ProjectMock {
    public readonly rootFilePaths: string[];
    private path: string;

    set parentDir(parentDir: string) {
        this.path = `${parentDir}/project`;
    }

    public async setup(): Promise<void> {
        await this.installNpmModules();
    }

    public async installNpmModules(): Promise<void> {
        const promise = spawn("npm", ["install"], {
            cwd: this.path,
        });

        const errors: string[] = [];

        promise.childProcess.stderr.on("error", (data) => {
            errors.push(data.toString());
        });

        await promise;

        if (errors.length > 0) {
            throw new Error(`npm install failed ${errors}`);
        }

        await spawn("npm", ["link", "@typical-linguist/collections-extension"], {
            cwd: this.path,
        });
    }

    public async getProgram(): Promise<any> {
        const rootFileNames = await this.readRootFilePaths();
        const workingDir = this.path;

        const ProgramProxy = new Proxy(Program, {
            construct(): any {
                return {
                    get compilerObject(): any {
                        return {
                            getRootFileNames(): string[] {
                                if (!rootFileNames) {
                                    throw new Error("Please run setup to instantiate the program mock first");
                                }

                                return rootFileNames;
                            },
                            getCurrentDirectory(): string {
                                if (!rootFileNames) {
                                    throw new Error("Please run setup to instantiate the program mock first");
                                }

                                return workingDir;
                            },
                            getCompilerOptions(): CompilerOptions {
                                if (!rootFileNames) {
                                    throw new Error("Please run setup to instantiate the program mock first");
                                }

                                return {
                                    outDir: `${workingDir}/build`,
                                };
                            },
                        };
                    },
                };
            },
        });

        return new ProgramProxy();
    }

    private async readRootFilePaths(): Promise<string[]> {
        return await recursiveReadDir(this.path, [
            "node_modules",
            `${this.path}/**/*.!(ts)`,
        ]);
    }
}
