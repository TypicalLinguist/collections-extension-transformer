import "behavioural-describe-mocha";
import {expect, use} from "chai";
import {existsSync} from "fs";
import {SinonSpy} from "sinon";
import sinon = require("sinon");
import sinonChai = require("sinon-chai");
import {SourceFile} from "ts-simple-ast";
import {filesToEqualLanguageChain} from "./chaiLanguageChains/filesToEqualLanguageChain";
import {throwErrorWithMessage} from "./chaiLanguageChains/throwErrorWithMessage";

use(sinonChai);

function filterOutDeclarationFiles(sourceFile: SourceFile): boolean {
    return !sourceFile.getFilePath().endsWith("d.ts");
}

use(throwErrorWithMessage);
use(filesToEqualLanguageChain);

use((chai: any, utils) => {
    const Assertion: any = chai.Assertion;
    Assertion.addMethod("calledInOrderWith", function(sourceFiles: SourceFile[]): void {
        const transforms = this._obj as SinonSpy[];

        sourceFiles.forEach((sourceFile) => {
            transforms.forEach((transform, index) => {
                if (index < 0) {
                    expect(transform).to.have.been.calledAfter(transforms[index - 1]);
                }

                const calls = transform.getCalls().map((call) => call.returnValue.getText());
                expect(calls).to.include(sourceFile.getText());
            });
        });
    });

    Assertion.addMethod("savedToDirectory", function(expectedDir: string): void {
        const transformedSourceFiles = this._obj as SourceFile[];

        transformedSourceFiles.forEach((sourceFile) => {
            const isSaved = sourceFile.isSaved();
            const baseName = sourceFile.getBaseName();
            const directory = sourceFile.getDirectoryPath();

            this.assert(isSaved, `expected file ${baseName} to be saved, but it was not`);
            this.assert(
                directory === expectedDir,
                `expected file ${baseName} to be saved to directory ${expectedDir} but it was saved to ${directory}`);
        });
    });

    Assertion.addMethod("compiledToJavascript", function(): void {
        const transformedSourceFiles = this._obj as SourceFile[];

        transformedSourceFiles.filter(filterOutDeclarationFiles).forEach((sourceFile) => {
            const path = sourceFile.getFilePath();
            const javascriptPath = path.replace(".ts", ".js");
            this.assert(existsSync(javascriptPath), `expected compiled javascript to exist at ${javascriptPath}`);
        });
    });
});

global.expect = expect;
global.sinon = sinon;
