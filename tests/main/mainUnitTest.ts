import Project, {SourceFile} from "ts-simple-ast";
import {arrayLiteralToNewArrayExpression} from "../../source/main/transforms/arrayLiteralToNewArrayExpression";
import {collectionsExtensionImport} from "../../source/main/transforms/collectionsExtensionImport";
import {createFakeFiles} from "../helpers/sourceFileMockHelper";
import {main, TransformSignature} from "../../source/main/main";
import {mkdirAsync, removeAsync} from "fs-extra-promise";
import {removeSync} from "fs-extra";

const tempDirectory = `.typicalLinguist`;
const cwd = process.cwd();
const sandbox = `${process.cwd()}/.sandbox`;

UnitUnderTest(`main`, function () {
    Given(`a project that is free of syntactical and semantic errors needs its code transformed`, function () {
        const transforms = createTransformSpies();

        const sourceFileCount: number = 9;
        let sourceFiles: SourceFile[],
            project: Project;

        beforeEach(async function () {
            await mkdirAsync(sandbox);
            process.chdir(sandbox);
            project = new Project();
            sourceFiles = createFakeFiles(project, sourceFileCount);
        });

        When(`the main() function is executed with that project`, function () {
            let returnedSourceFiles: SourceFile[];

            beforeEach(function () {
                returnedSourceFiles = main(project, transforms);
                reduceToStringOutput(returnedSourceFiles);
            });

            Then(`the transformation functions should be executed on each file in the correct order`, function () {
                expect(transforms).to.have.been.calledInOrderWith(returnedSourceFiles);
            });

            Then(`the transformed source files should be saved to the ${tempDirectory} directory`, function () {
                expect(returnedSourceFiles).to.be.savedToDirectory(`${sandbox}/${tempDirectory}`)
            });

            Then(`the transformed source files in ${tempDirectory} directory should compiled to javascript`, function () {
                expect(returnedSourceFiles).to.be.compiledToJavascript()
            });

            afterEach(async function () {
                process.chdir(cwd);
                await removeAsync(sandbox);
            })
        })
    })
});

function createTransformSpies(): TransformSignature[] {
    return [
        sinon.spy(arrayLiteralToNewArrayExpression),
        sinon.spy(collectionsExtensionImport)
    ];
}

function reduceToStringOutput(sourceFiles: SourceFile[]) {
    sourceFiles.forEach(sourceFile => sourceFile.toString = () => `(SourceFile: ${sourceFile.getBaseName()})`);
}

process.on('exit', function () {
    removeSync(sandbox);
});