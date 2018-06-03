import Project, {SourceFile} from "ts-simple-ast";
import {main, TransformerSignature} from "../../source/main/main";
import {createErrorMessageFromTemplate} from "../../source/main/secondPass";
import {arrayLiteralToNewArrayExpression} from "../../source/main/transforms/arrayLiteralToNewArrayExpression";
import {collectionsExtensionImport} from "../../source/main/transforms/collectionsExtensionImport";
import {Sandbox} from "../helpers/Sandbox";
import {createVirtualSourceFiles} from "../helpers/sourceFileMockHelper";

UnitUnderTest(`main`, function(): void {
    this.timeout(10000);

    let tempDirectory: string;
    let sandbox: Sandbox;

    beforeEach(async function(): Promise<any> {
        sandbox = new Sandbox();
        await sandbox.setup();
        tempDirectory = `${sandbox.path}/.typicalLinguist`;
    });

    Given(`a project that is free of syntactical and semantic errors that needs its code transformed`,
        function(): void {

            const sourceFileCount: number = 9;
            let sourceFiles: SourceFile[];
            let project: Project;

            beforeEach(async function(): Promise<any> {
                project = new Project();
                sourceFiles = createVirtualSourceFiles(project, sourceFileCount);
            });

            When(`the main() function is executed with that project`, function(): void {
                const transforms = createTransformSpies();

                let returnedSourceFiles: SourceFile[];

                beforeEach(function(): void {
                    returnedSourceFiles = main(project, transforms);
                    reduceStringOutput(returnedSourceFiles);
                });

                Then(`the transformation functions should be executed on each file in the correct order`,
                    function(): void {
                        expect(transforms).to.have.been.calledInOrderWith(returnedSourceFiles);
                    },
                );

                Then(`the transformed source files should be saved to the temporary directory`,
                    function(): void {
                        expect(returnedSourceFiles).to.be.savedToDirectory(`${tempDirectory}`);
                    },
                );

                Then(`the transformed source files in temporary directory should compiled to javascript`,
                    function(): void {
                        expect(returnedSourceFiles).to.be.compiledToJavascript();
                    },
                );
            });

            And(`the transformations introduces syntactical or semantic errors`, function(): void {
                const transforms = [
                    breakingTransformFunction,
                ];

                const expectedDiagnosticErrors = [
                    "';' expected.",
                    "';' expected.",
                    "';' expected.",
                    "';' expected.",
                    "';' expected.",
                    "';' expected.",
                    "';' expected.",
                    "';' expected.",
                    "';' expected.",
                    "Cannot find name '________________________let'.",
                    "Cannot find name 'content0'.",
                    "Cannot find name '________________________let'.",
                    "Cannot find name 'content1'.",
                    "Cannot find name '________________________let'.",
                    "Cannot find name 'content2'.",
                    "Cannot find name '________________________let'.",
                    "Cannot find name 'content3'.",
                    "Cannot find name '________________________let'.",
                    "Cannot find name 'content4'.",
                    "Cannot find name '________________________let'.",
                    "Cannot find name 'content5'.",
                    "Cannot find name '________________________let'.",
                    "Cannot find name 'content6'.",
                    "Cannot find name '________________________let'.",
                    "Cannot find name 'content7'.",
                    "Cannot find name '________________________let'.",
                    "Cannot find name 'content8'.",
                ];

                const errorMessage = createErrorMessageFromTemplate(expectedDiagnosticErrors);

                When(`the main() function is executed with that project`, function(): void {
                    Then(`then an error with the message: \n\t\t${errorMessage} \n\t\t should be thrown`,
                        function(): void {
                            function executeMain(): void {
                                main(project, transforms);
                            }

                            expect(executeMain).to.throwErrorWithMessage(errorMessage);
                        },
                    );
                });
            });
        });

    Given(`a project that needs its code transformed, but has syntactical and semantic errors`, function(): void {
        const transforms = createTransformSpies();

        const sourceFileCount: number = 1;
        let sourceFiles: SourceFile[];
        let project: Project;

        beforeEach(async function(): Promise<any> {
            project = new Project();
            sourceFiles = createVirtualSourceFiles(project, sourceFileCount, true);
        });

        When(`the main() function is executed with that project`, function(): void {
            Then(`the process should exit with code 1`, function(): void {
                main(project, transforms);

                expect(process.exitCode).to.equal(1);
            });

            const expectedDiagnosticErrors = [
                "';' expected.",
                "';' expected.",
                "';' expected.",
                "';' expected.",
                "';' expected.",
                "';' expected.",
                "';' expected.",
                "';' expected.",
                "';' expected.",
                "Cannot find name '________________________let'.",
                "Cannot find name 'content0'.",
                "Cannot find name '________________________let'.",
                "Cannot find name 'content1'.",
                "Cannot find name '________________________let'.",
                "Cannot find name 'content2'.",
                "Cannot find name '________________________let'.",
                "Cannot find name 'content3'.",
                "Cannot find name '________________________let'.",
                "Cannot find name 'content4'.",
                "Cannot find name '________________________let'.",
                "Cannot find name 'content5'.",
                "Cannot find name '________________________let'.",
                "Cannot find name 'content6'.",
                "Cannot find name '________________________let'.",
                "Cannot find name 'content7'.",
                "Cannot find name '________________________let'.",
                "Cannot find name 'content8'.",
            ];

            const errorMessage = createErrorMessageFromTemplate(expectedDiagnosticErrors);

            Then(`an error with the message: \n\t\t${errorMessage} \n\t\t should not be thrown`, function(): void {
                function executeMain(): void {
                    main(project, transforms);
                }

                expect(executeMain).to.not.throwErrorWithMessage(errorMessage);
            });
        });
    });

    afterEach(async function(): Promise<any> {
        await sandbox.tearDown();
    });
});

function createTransformSpies(): TransformerSignature[] {
    return [
        sinon.spy(arrayLiteralToNewArrayExpression),
        sinon.spy(collectionsExtensionImport),
    ];
}

function reduceStringOutput(sourceFiles: SourceFile[]): void {
    sourceFiles.forEach((sourceFile) => sourceFile.toString = () => `(SourceFile: ${sourceFile.getBaseName()})`);
}

function breakingTransformFunction(sourceFile: SourceFile): SourceFile {
    const tempFile = sourceFile.copy(`./.typicalLinguist/${sourceFile.getBaseName()}`);
    tempFile.insertText(0, "________________________");
    return tempFile;
}
