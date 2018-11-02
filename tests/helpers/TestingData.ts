import {spawn} from "child-process-promise";
import {copyAsync, readFileAsync} from "fs-extra-promise";
import {basename} from "path";
import {TestSuites} from "./TestSuites";
import {Map} from "@typical-linguist/collections-extension";
import recursiveReadDir = require("recursive-readdir");

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

    public async getFiles(state: TestingDataState, fileType: TestingDataFileType): Promise<Map<string, string>> {
        const actualFilePaths = await recursiveReadDir(this.getDirectoryPath(state, fileType));

        actualFilePaths.sort();

        const actualFiles = new Map<string, string>();

        const assertionPromises = actualFilePaths.map(async (filePath, index) => {
            const actualContent = (await readFileAsync(filePath)).toString();
            actualFiles.set(basename(filePath), actualContent);
        });

        await Promise.all(assertionPromises);

        return actualFiles;
    }

    private getDirectoryPath(state: TestingDataState, fileType: TestingDataFileType): string {
        const testingData = this;
        const directoryPathToStateMap = {
            actual: `${testingData.path}/project/.typicalLinguist`,
            expected: `${testingData.path}/${testingData.testSuite}/expected${fileType.name}Files`,
            initial: `${testingData.path}/${testingData.testSuite}/initial${fileType.name}Files`,
        };

        return directoryPathToStateMap[state];
    }
}

export abstract class TestingDataFileType {
    protected static instance: JavascriptFile | TypescriptFileType | TypescriptDefinitionFileType;

    public readonly name: string;
    public readonly extension: string;

    public static get Instance(): JavascriptFile | TypescriptFileType | TypescriptDefinitionFileType {
        return TestingDataFileType.instance;
    }
}

export class JavascriptFile extends TestingDataFileType {
    public readonly name = "Javascript";
    public readonly extension = "js";

    private constructor() {
        super();
    }

    public static get Instance(): JavascriptFile {
        return this.instance as JavascriptFile || (this.instance = new this());
    }
}

export class TypescriptFileType extends TestingDataFileType {
    public readonly name = "Typescript";
    public readonly extension = "ts";

    private constructor() {
        super();
    }

    public static get Instance(): TypescriptFileType {
        return this.instance as TypescriptFileType || (this.instance = new this());
    }
}

export class TypescriptDefinitionFileType extends TestingDataFileType {
    public readonly name = "TypescriptDefinition";
    public readonly extension = "d.ts";

    private constructor() {
        super();
    }

    public static get Instance(): TypescriptDefinitionFileType {
        return this.instance as TypescriptDefinitionFileType || (this.instance = new this());
    }
}

export enum TestingDataState {
    EXPECTED = "expected",
    ACTUAL = "actual",
    INITIAL = "initial",
}