import {expect, use} from 'chai';
import 'behavioural-describe-mocha'
import {SinonSpy} from "sinon";
import {SourceFile} from "ts-simple-ast";
import {TransformSignature} from "../../source/main/main";
import * as assert from "assert";
import {existsSync} from "fs";
import sinon = require("sinon");
import sinonChai = require("sinon-chai");

use(sinonChai);

use(function (chai: any) {
    const Assertion: any = chai.Assertion;
    Assertion.addMethod('calledInOrderWith', function (sourceFiles: SourceFile[]) {
        const transforms = this._obj as TransformSignature[];

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

            assert(isSaved, `expected file ${baseName} to be saved, but it was not`);
            assert(directory === expectedDir, `expected file ${baseName} to be saved to directory ${expectedDir} but it was saved to ${directory}`)
        });
    })

    Assertion.addMethod('compiledToJavascript', function () {
        const transformedSourceFiles = this._obj as SourceFile[];

        transformedSourceFiles.forEach(sourceFile => {
            const path = sourceFile.getFilePath();
            const javascriptPath = path.replace('.ts', '.js')
            assert(existsSync(javascriptPath), `expected compiled javascript to exist at ${javascriptPath}`)
        });
    });
});

global.expect = expect;
global.sinon = sinon;
