import {CompilerOptions, SourceFile} from "ts-simple-ast";
import {main, TransformerSignature} from "../../source/main/main";
import {createErrorMessageFromTemplate} from "../../source/main/secondPass";
import {arrayLiteralToNewArrayExpression} from "../../source/main/transforms/arrayLiteralToNewArrayExpression";
import {collectionsExtensionImport} from "../../source/main/transforms/collectionsExtensionImport";
import {Sandbox} from "../helpers/Sandbox";
import {createSourceFiles} from "../helpers/sourceFileMockHelper";
import {getJavascriptPaths} from "../config/mocha-bootstrap";
import recursiveReadSync = require("recursive-readdir-sync");

function executeMainToCompletion(sandbox: Sandbox,
                                 sourceFilePaths: string[],
                                 compilerOptions: CompilerOptions,
                                 transforms: TransformerSignature[],
                                 removeDirSpy: () => void): void {

    sandbox.mockProcessEventHandler();

    main(
        sandbox.path,
        sourceFilePaths,
        compilerOptions,
        transforms,
        removeDirSpy,
    );

    sandbox.emitFakeProcessExitEvent();
}

UnitUnderTest(`main`, function(): void {
    this.timeout(50000);

    let sourceFilePaths: string[];
    let tempDirectory: string;
    let sandbox: Sandbox;
    let outDir: string;
    let compilerOptions: CompilerOptions;

    function fakeRemoveSync(dir: string): void {
        "empty";
    }

    beforeEach(async function(): Promise<any> {
        sandbox = new Sandbox();
        await sandbox.setup();
        tempDirectory = `${sandbox.path}/.typicalLinguist`;
        outDir = `${sandbox.path}/build`;
        compilerOptions = {
            outDir,
        };
    });

    Given(`a project that is free of syntactical and semantic errors that needs its code transformed`,
        function(): void {
            const sourceFileCount: number = 9;

            beforeEach(async function(): Promise<any> {
                sourceFilePaths = createSourceFiles(sandbox.path, sourceFileCount);
            });

            When(`the main() function is executed with that project`, function(): void {
                const removeDirSpy = sinon.spy(fakeRemoveSync);

                const transforms = createTransformSpies();

                let producedFilePaths: string[];

                beforeEach(function(): void {
                    executeMainToCompletion(sandbox, sourceFilePaths, compilerOptions, transforms, removeDirSpy);

                    producedFilePaths = recursiveReadSync(tempDirectory)
                        .filter((file) => !file.endsWith("lib.d.ts"))
                        .filter((file) => !file.endsWith("js"));
                });

                Then(`the transformation functions should be executed on each file in the correct order`,
                    function(): void {
                        expect(transforms).to.have.been.calledInOrderWith(producedFilePaths);
                    },
                );

                Then(`the transformed source files should be saved to the temporary directory`,
                    function(): void {
                        expect(producedFilePaths).to.be.savedToDirectory(`${tempDirectory}`);
                    },
                );

                Then(`the transformed source files in temporary directory should compiled to javascript`,
                    function(): void {
                        expect(producedFilePaths).to.be.compiledToJavascript();
                    },
                );

                And(`the source files have been compiled to javascript`, function(): void {
                    let relativeFilePaths: string[];
                    beforeEach(function(): void {
                        relativeFilePaths = getJavascriptPaths(producedFilePaths)
                            .map((path) => path.split(`${tempDirectory}/`)[1]);
                    });

                    Then(`the compiled javascript should be moved to the "outDir"`,
                        function(): void {
                            expect(relativeFilePaths)
                                .files.to.be.copied.from.source(tempDirectory).to.destination(outDir);
                        },
                    );
                });

                Then(`the temporary directory should be removed`,
                    function(): void {
                        expect(removeDirSpy).to.have.been.calledWith(tempDirectory);
                    },
                );
            });

            And(`the transformations introduces syntactical or semantic errors`, function(): void {
                const removeDirSpy = sinon.spy(fakeRemoveSync);

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
                            try {
                                executeMainToCompletion(
                                    sandbox,
                                    sourceFilePaths,
                                    compilerOptions,
                                    transforms,
                                    removeDirSpy,
                                );
                            } catch (e) {
                                expect(e.message).to.equal(errorMessage);
                            }
                        },
                    );

                    Then(`the temporary directory should not be removed`,
                        function(): void {
                            try {
                                executeMainToCompletion(
                                    sandbox,
                                    sourceFilePaths,
                                    compilerOptions,
                                    transforms,
                                    removeDirSpy,
                                );
                            } catch (e) {
                                expect(removeDirSpy).to.not.have.been.calledWith(tempDirectory);
                            }
                        },
                    );
                });
            });
        });

    Given(`a project that needs its code transformed, but has syntactical and semantic errors`, function(): void {
        const transforms = createTransformSpies();

        const sourceFileCount: number = 1;

        beforeEach(async function(): Promise<any> {
            sourceFilePaths = createSourceFiles(sandbox.path, sourceFileCount, true);
        });

        When(`the main() function is executed with that project`, function(): void {
            const removeDirSpy = sinon.spy(fakeRemoveSync);

            Then(`the process should exit with code 1`, async function(): Promise<void> {
                executeMainToCompletion(
                    sandbox,
                    sourceFilePaths,
                    compilerOptions,
                    transforms,
                    removeDirSpy,
                );

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

            Then(`an error with the message: \n\t\t${errorMessage} \n\t\t should not be thrown`,
                async function(): Promise<void> {
                    try {
                        executeMainToCompletion(
                            sandbox,
                            sourceFilePaths,
                            compilerOptions,
                            transforms,
                            removeDirSpy,
                        );
                    } catch (e) {
                        expect(e.message).to.not.equal(errorMessage);
                    }
                },
            );

            Then(`the temporary directory should not be removed`,
                async function(): Promise<void> {
                    try {
                        executeMainToCompletion(
                            sandbox,
                            sourceFilePaths,
                            compilerOptions,
                            transforms,
                            removeDirSpy,
                        );
                    } catch (e) {
                        expect(removeDirSpy).to.not.have.been.calledWith(tempDirectory);
                    }
                },
            );
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

function breakingTransformFunction(sourceFile: SourceFile): SourceFile {
    const tempFile = sourceFile.copy(`./.typicalLinguist/${sourceFile.getBaseName()}`);
    tempFile.insertText(0, "________________________");
    return tempFile;
}
