import {spawn} from "child-process-promise";
import {copyAsync, readFileAsync} from "fs-extra-promise";
import {basename} from "path";
import recursiveReadDir = require("recursive-readdir");
import {TestSuites} from "./TestSuites";

export class TestingData {
    public path: string = "";

    constructor(public readonly testSuite: TestSuites) {
    }

    public async getTestingData(): Promise<void> {
        const gitArguments = `clone git@github.com:TypicalLinguist/collections-extension-testing-data.git ${this.path}`;
        await spawn("git", gitArguments.split(" "));
    }

    public async copyInitialTypescriptFilesToProject(): Promise<void> {
        await copyAsync(`${this.path}/${this.testSuite}/initialTypescriptFiles`, `${this.path}/project`);
    }

    public async getExpectedTypescriptFiles(): Promise<Map<string, string>> {
        const directory = `${this.path}/${this.testSuite}/expectedTypescriptFiles`;
        return await this.getFiles(directory, [`${directory}/**/*.!(ts)`]);
    }

    public async getInitialTypescriptFiles(): Promise<Map<string, string>> {
        const directory = `${this.path}/${this.testSuite}/initialTypescriptFiles`;
        return await this.getFiles(directory, [`${directory}/**/*.!(ts)`]);
    }

    public async getExpectedJs(): Promise<Map<string, string>> {
        return await this.getFiles("expectedJs/", ["**/*.!ts"]);
    }

    public async getActualJs(): Promise<Map<string, string>> {
        return await this.getFiles("project/.typicalLinguist/", ["**/*.!js"]);
    }

    public async getActualTypescriptFiles(): Promise<Map<string, string>> {
        const directory = `${this.path}/project/.typicalLinguist`;
        return await this.getFiles(directory, [`${directory}/**/*.!(ts)`]);
    }

    private async getFiles(directory: string, exclusionGlob: string[]): Promise<Map<string, string>> {
        const actualFilePaths = await recursiveReadDir(directory, exclusionGlob);

        actualFilePaths.sort();

        const actualFiles = new Map<string, string>();

        const assertionPromises = actualFilePaths.map(async (filePath, index) => {
            const actualContent = (await readFileAsync(filePath)).toString();
            actualFiles.set(basename(filePath), actualContent);
        });

        await Promise.all(assertionPromises);

        return actualFiles;
    }
}
