import {existsAsync, mkdirAsync, removeAsync} from "fs-extra-promise";
import {ProjectMock} from "./ProjectMock";
import {TestingData} from "./TestingData";

export {Sandbox};

class Sandbox {
    public readonly path: string;
    public readonly parentDirectoryPath: string;
    public readonly realProcessExit = process.exit;

    private testingData: TestingData;
    private projectMock: ProjectMock;
    private fakeExitListener: () => void;
    private exitListener: () => void;
    private oldProcessOn: any;

    constructor(testingData?: TestingData, projectMock?: ProjectMock) {
        this.parentDirectoryPath = process.cwd();
        this.path = `${process.cwd()}/.sandbox`;

        if (testingData) {
            this.testingData = testingData;
            testingData.path = this.path;
        }

        if (projectMock) {
            this.projectMock = projectMock;
            projectMock.parentDir = this.path;
        }
    }

    public async setup(): Promise<void> {
        await this.createSandboxEnvironment();

        if (this.testingData) {
            await this.testingData.getTestingData();
            await this.testingData.copyInitialTypescriptFilesToProject();
        }

        if (this.projectMock) {
            await this.projectMock.setup();
        }
    }

    public async tearDown(): Promise<void> {
        process.exit = this.realProcessExit;
        process.chdir(this.parentDirectoryPath);
        await removeAsync(this.path);
    }

    public mockProcessEventHandler(): void {
        this.oldProcessOn = process.on;

        process.on = (event, func: () => void) => {
            if (event === "exit") {
                this.fakeExitListener = func;
                process.on = this.oldProcessOn;
            }
        };
    }

    public emitFakeProcessExitEvent(): void {
        this.removeCleanUpTasks();

        this.fakeExitListener();

        this.registerCleanUpTasks();
    }

    private removeCleanUpTasks(): void {
        process.removeListener("exit", this.exitListener);
    }

    private registerCleanUpTasks(): void {
        this.exitListener = () => {
            existsAsync(this.path).then((exists) => {
                if (exists) {
                    removeAsync(this.path);
                }
            });
        };

        process.on("exit", this.exitListener);
    }

    private async createSandboxEnvironment(): Promise<void> {
        await mkdirAsync(this.path);
        process.chdir(this.path);
        this.registerCleanUpTasks();

        this.mockProcess();
    }

    private mockProcess(): void {
        process.exit = (exitCode: number = 0): void => {
            process.exitCode = exitCode;
        };
    }
}
