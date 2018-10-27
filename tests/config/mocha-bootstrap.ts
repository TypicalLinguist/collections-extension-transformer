import "behavioural-describe-mocha";
import {expect, use} from "chai";
import {existsSync, readFileSync} from "fs";
import {SinonSpy} from "sinon";
import {filesToEqualLanguageChain} from "./chaiLanguageChains/filesToEqualLanguageChain";
import {basename, dirname} from "path";
import chaiAsPromised = require("chai-as-promised");
import sinon = require("sinon");
import sinonChai = require("sinon-chai");

use(sinonChai);
use(chaiAsPromised);
use(filesToEqualLanguageChain);
use((chai: any, utils) => {
    const Assertion: any = chai.Assertion;
    Assertion.addMethod("calledInOrderWith", function(transformedFilePaths: string[]): void {
        const transforms = this._obj as SinonSpy[];

        transformedFilePaths.forEach((sourceFile) => {
            transforms.forEach((transform, index) => {
                if (index < 0) {
                    expect(transform).to.have.been.calledAfter(transforms[index - 1]);
                }

                const calls = transform.getCalls().map((call) => call.returnValue.getFilePath());
                expect(calls).to.include(sourceFile);
            });
        });
    });

    Assertion.addMethod("savedToDirectory", function(expectedDir: string): void {
        const transformedSourceFiles = this._obj as string[];

        transformedSourceFiles.forEach((sourceFile) => {
            this.assert(
                dirname(sourceFile) === expectedDir,
                `expected file ${basename(sourceFile)} ` +
                `to be saved to directory ${expectedDir} but it was saved to ${dirname(sourceFile)}`);
        });
    });

    Assertion.addMethod("compiledToJavascript", function(): void {
        const transformedSourceFiles = this._obj as string[];

        getJavascriptPaths(transformedSourceFiles).forEach((javascriptPath) => {
            this.assert(existsSync(javascriptPath), `expected compiled javascript to exist at ${javascriptPath}`);
        });
    });

    Assertion.addMethod("destination", function(destinationDir: string): void {
        const sourceDir = utils.flag(this, "sourceDir");
        const files = this._obj as string[];

        const missingFiles = files.filter((file) => {
            return !existsSync(`${destinationDir}/${file}`);
        });

        this.assert(missingFiles.length === 0, `expected javascript files to be copied over, but the following files` +
            ` were not copied: \n${files.join("\n")}`);

        const mismatchedContent: string[] = files.filter((file: string) => {
            const sourceContent = readFileSync(`${sourceDir}/${file}`).toString();
            const destinationContent = readFileSync(`${destinationDir}/${file}`).toString();
            return sourceContent !== destinationContent;
        });

        this.assert(mismatchedContent.length === 0, `expected javascript files to be copied over,`
            + `but the following files at the source directory and destination directory had mismatched content: `
            + `\n${mismatchedContent.join("\n")}`);
    });

    Assertion.addProperty("copied", function(): void {
        utils.flag(this, "copied", true);
    });

    Assertion.addProperty("from", function(): void {
        utils.flag(this, "from", true);
    });

    Assertion.addMethod("source", function(sourceDir: string): void {
        utils.flag(this, "sourceDir", sourceDir);
    });
});

export function getJavascriptPaths(transformedSourceFiles: string[]): string[] {
    return transformedSourceFiles.filter(filterOutDeclarationFiles).map((filePath) => {
        return filePath.replace(".ts", ".js");
    });
}

function filterOutDeclarationFiles(filePath: string): boolean {
    return !filePath.endsWith("d.ts");
}

global.expect = expect;
global.sinon = sinon;
