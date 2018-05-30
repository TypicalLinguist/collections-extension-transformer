import Project, {SourceFile} from "ts-simple-ast";
import {arrayLiteralToNewArrayExpression} from "../../source/main/transforms/arrayLiteralToNewArrayExpression";
import {collectionsExtensionImport} from "../../source/main/transforms/collectionsExtensionImport";
import {createErrorMessageFromTemplate, main, TransformerSignature} from "../../source/main/main";
import {createVirtualSourceFiles} from "../helpers/sourceFileMockHelper";
import {Sandbox} from "../helpers/sandbox";

UnitUnderTest(`main`, function () {
    this.timeout(10000);

    let tempDirectory: string;

    const realProcessExit = process.exit;

    beforeEach(async function () {
        await Sandbox.setup();
        tempDirectory = `${Sandbox.path}/.typicalLinguist`;
        process.exit = function (exitCode: number = 0): void {
            process.exitCode = exitCode
        };
    });

    Given(`a project that is free of syntactical and semantic errors that needs its code transformed`, function () {
        const sourceFileCount: number = 9;
        let sourceFiles: SourceFile[],
            project: Project;

        beforeEach(async function () {
            project = new Project();
            sourceFiles = createVirtualSourceFiles(project, sourceFileCount);
        });

        When(`the main() function is executed with that project`, function () {
            const transforms = createTransformSpies();

            let returnedSourceFiles: SourceFile[];

            beforeEach(function () {
                returnedSourceFiles = main(project, transforms);
                reduceStringOutput(returnedSourceFiles);
            });

            Then(`the transformation functions should be executed on each file in the correct order`, function () {
                expect(transforms).to.have.been.calledInOrderWith(returnedSourceFiles);
            });

            Then(`the transformed source files should be saved to the temporary directory`, function () {
                expect(returnedSourceFiles).to.be.savedToDirectory(`${tempDirectory}`)
            });

            Then(`the transformed source files in temporary directory should compiled to javascript`, function () {
                expect(returnedSourceFiles).to.be.compiledToJavascript()
            });

            Then(`the sources files that are altered should be returned`, function () {
                expect(sourceFiles).to.throw
            });
        });

        And(`the transformations introduce syntactical or semantic errors`, function () {
            const transforms = [
                breakingTransformFunction
            ];

            const expectedDiagnosticErrors = [
                '\';\' expected.',
                '\';\' expected.',
                '\';\' expected.',
                '\';\' expected.',
                '\';\' expected.',
                '\';\' expected.',
                '\';\' expected.',
                '\';\' expected.',
                '\';\' expected.',
                'Cannot find name \'________________________let\'.',
                'Cannot find name \'content0\'.',
                'Cannot find name \'________________________let\'.',
                'Cannot find name \'content1\'.',
                'Cannot find name \'________________________let\'.',
                'Cannot find name \'content2\'.',
                'Cannot find name \'________________________let\'.',
                'Cannot find name \'content3\'.',
                'Cannot find name \'________________________let\'.',
                'Cannot find name \'content4\'.',
                'Cannot find name \'________________________let\'.',
                'Cannot find name \'content5\'.',
                'Cannot find name \'________________________let\'.',
                'Cannot find name \'content6\'.',
                'Cannot find name \'________________________let\'.',
                'Cannot find name \'content7\'.',
                'Cannot find name \'________________________let\'.',
                'Cannot find name \'content8\'.'
            ];

            const errorMessage = createErrorMessageFromTemplate(expectedDiagnosticErrors);

            When(`the main() function is executed with that project`, function () {
                Then(`then an error with the message: \n\t\t${errorMessage} \n\t\t should be thrown`, function () {
                    function executeMain() {
                        main(project, transforms)
                    }

                    expect(executeMain).to.throwErrorWithMessage(errorMessage)
                });
            })
        })
    });

    Given(`a project that needs its code transformed, but has syntactical and semantic errors`, function () {
        const transforms = createTransformSpies();

        const sourceFileCount: number = 1;
        let sourceFiles: SourceFile[],
            project: Project;

        beforeEach(async function () {
            project = new Project();
            sourceFiles = createVirtualSourceFiles(project, sourceFileCount, true);
        });


        When(`the main() function is executed with that project`, function () {
            Then(`the process should exit with code 1`, function () {
                main(project, transforms);

                expect(process.exitCode).to.equal(1)
            });

            const expectedDiagnosticErrors = [
                '\';\' expected.',
                '\';\' expected.',
                '\';\' expected.',
                '\';\' expected.',
                '\';\' expected.',
                '\';\' expected.',
                '\';\' expected.',
                '\';\' expected.',
                '\';\' expected.',
                'Cannot find name \'________________________let\'.',
                'Cannot find name \'content0\'.',
                'Cannot find name \'________________________let\'.',
                'Cannot find name \'content1\'.',
                'Cannot find name \'________________________let\'.',
                'Cannot find name \'content2\'.',
                'Cannot find name \'________________________let\'.',
                'Cannot find name \'content3\'.',
                'Cannot find name \'________________________let\'.',
                'Cannot find name \'content4\'.',
                'Cannot find name \'________________________let\'.',
                'Cannot find name \'content5\'.',
                'Cannot find name \'________________________let\'.',
                'Cannot find name \'content6\'.',
                'Cannot find name \'________________________let\'.',
                'Cannot find name \'content7\'.',
                'Cannot find name \'________________________let\'.',
                'Cannot find name \'content8\'.'
            ];

            const errorMessage = createErrorMessageFromTemplate(expectedDiagnosticErrors);

            Then(`an error with the message: \n\t\t${errorMessage} \n\t\t should not be thrown`, function () {
                function executeMain() {
                    main(project, transforms)
                }

                expect(executeMain).to.not.throwErrorWithMessage(errorMessage)
            })
        })
    });

    afterEach(async function () {
        process.exit = realProcessExit;
        await Sandbox.tearDown();
    })
});

function createTransformSpies(): TransformerSignature[] {
    return [
        sinon.spy(arrayLiteralToNewArrayExpression),
        sinon.spy(collectionsExtensionImport)
    ];
}

function reduceStringOutput(sourceFiles: SourceFile[]) {
    sourceFiles.forEach(sourceFile => sourceFile.toString = () => `(SourceFile: ${sourceFile.getBaseName()})`);
}

function breakingTransformFunction(sourceFile: SourceFile) {
    const tempFile = sourceFile.copy(`./.typicalLinguist/${sourceFile.getBaseName()}`)
    tempFile.insertText(0, '________________________');
    return tempFile;
}