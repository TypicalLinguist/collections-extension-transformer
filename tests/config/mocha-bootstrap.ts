import {expect, use} from 'chai';
import 'behavioural-describe-mocha'
import {SinonSpy} from "sinon";
import {SourceFile} from "ts-simple-ast";
import {TransformerSignature} from "../../source/main/main";
import {existsSync} from "fs";
import sinon = require("sinon");
import sinonChai = require("sinon-chai");

use(sinonChai);

function filterOutDeclarationFiles(sourceFile: SourceFile): boolean {
    return !sourceFile.getFilePath().endsWith('d.ts');
}

use(function (chai: any, utils) {
    const Assertion: any = chai.Assertion;
    Assertion.addMethod('calledInOrderWith', function (sourceFiles: SourceFile[]) {
        const transforms = this._obj as TransformerSignature[];

        sourceFiles.forEach(sourceFile => {
            transforms.forEach((transform, index) => {
                if (index < 0)
                    expect(transform).to.have.been.calledAfter(transforms[index - 1] as SinonSpy);
                expect(transform).to.have.been.calledWith(sourceFile)
            })
        });
    });

    Assertion.addMethod('savedToDirectory', function (expectedDir: string) {
        const transformedSourceFiles = this._obj as SourceFile[];

        transformedSourceFiles.forEach(sourceFile => {
            const isSaved = sourceFile.isSaved();
            const baseName = sourceFile.getBaseName();
            const directory = sourceFile.getDirectoryPath();

            this.assert(isSaved, `expected file ${baseName} to be saved, but it was not`);
            this.assert(directory === expectedDir, `expected file ${baseName} to be saved to directory ${expectedDir} but it was saved to ${directory}`)
        });
    });

    Assertion.addMethod('compiledToJavascript', function () {
        const transformedSourceFiles = this._obj as SourceFile[];

        transformedSourceFiles.filter(filterOutDeclarationFiles).forEach(sourceFile => {
            const path = sourceFile.getFilePath();
            const javascriptPath = path.replace('.ts', '.js');
            this.assert(existsSync(javascriptPath), `expected compiled javascript to exist at ${javascriptPath}`)
        });
    });

    let pass: boolean;

    function throwErrorWithMessage(errorMessage: string) {
        const func: Function = this._obj as Function;

        const negate = utils.flag(this, 'negate');

        try {
            func()
        } catch (e) {
            const hasExpectedMessage = e.message === errorMessage;
            pass = negate ? !hasExpectedMessage : hasExpectedMessage;
            this.assert(
                pass,
                `\n\t expected ${func} to throw an Error with message: \n` +
                `\t\t ${errorMessage}\n` +
                `\t ${negate ? 'NOT' : ''} to be thrown, but got Error with message:\n` +
                `\t\t ${e.message}`
            );
        }
        if (!pass && !negate)
            throw new Error(`expected \n\t ${func} \n\t to throw an Error with message: \n` +
                `\t\t ${errorMessage}\n` +
                `\t but it was never thrown.`
            )
    }

    Assertion.addMethod('throwErrorWithMessage', throwErrorWithMessage);

});

global.expect = expect;
global.sinon = sinon;
