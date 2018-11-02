import {spawn} from "child-process-promise";
import {CompilerOptions, Program, ts} from "ts-simple-ast";
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

        await spawn("npm", ["link", "@typical-linguist/collections-extension-globals"], {
            cwd: this.path,
        });
    }

    public async getProgram(): Promise<any> {
        const rootFileNames = await this.readRootFilePaths();
        const workingDir = this.path;
        rootFileNames
            .push(`${workingDir}/node_modules/@typical-linguist/collections-extension-globals/index.d.ts`);
        const instantiateProgramMockFirstMessage = "Please run setup to instantiate the program mock first";

        const ProgramProxy = new Proxy(Program, {
            construct(): any {
                return {
                    get compilerObject(): any {
                        return {
                            getRootFileNames(): string[] {
                                if (!rootFileNames) {
                                    throw new Error(instantiateProgramMockFirstMessage);
                                }

                                return rootFileNames;
                            },
                            getCurrentDirectory(): string {
                                if (!rootFileNames) {
                                    throw new Error(instantiateProgramMockFirstMessage);
                                }

                                return workingDir;
                            },
                            getCompilerOptions(): CompilerOptions {
                                if (!rootFileNames) {
                                    throw new Error(instantiateProgramMockFirstMessage);
                                }

                                return {
                                    module: ts.ModuleKind.CommonJS,
                                    outDir: `${workingDir}/build`,
                                    target: ts.ScriptTarget.ES2017,
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
