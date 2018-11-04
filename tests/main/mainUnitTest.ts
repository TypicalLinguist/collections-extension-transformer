import {spawn} from "child-process-promise";
import {writeJsonAsync} from "fs-extra-promise";
import {CompilerOptions, SourceFile, ts} from "ts-simple-ast";
import {main, TransformerSignature} from "../../source/main/main";
import {collectionsExtensionImport} from "../../source/main/transforms/collectionsExtensionImport";
import {getJavascriptPaths} from "../config/mocha-bootstrap";
import {Sandbox} from "../helpers/Sandbox";
import {createSourceFiles} from "../helpers/sourceFileMockHelper";
import {arrayLiteralToArray} from "../../source/main/transforms/arrayLiteralToArray/main";
import recursiveReadSync = require("recursive-readdir-sync");

xUnitUnderTest(`main`, function(): void {
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
            rootDir: sandbox.path,
            outDir,
            target: ts.ScriptTarget.ES2017,
            module: ts.ModuleKind.CommonJS,
        };
    });

    Given(`a project that is free of syntactical and semantic errors that needs its code transformed`,
        function(): void {
            const sourceFileCount: number = 9;

            beforeEach(async function(): Promise<any> {
                await configureNodeModules(sandbox);

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

                const errorMessage = "Error introduced by Typical Linguist plugin 'collection-extension-transformer'. This is most probable our fault.\n" +
                    "\t\t Please Raise an issue on github: https://github.com/TypicalLinguist/collections-extension-issues/issues/new. \n" +
                    "\t\t and include the relevant files/snippets in the error(s) below in the issue from the " +
                    "generated ./.typical-linguist temporary directory \n" +
                    "Actual:\n" +
                    "[96m.typicalLinguist/file0.ts[0m:[93m1[0m:[93m1[0m - [91merror[0m[90m TS2304: [0mCannot find name '________________________let'.\n" +
                    "\n" +
                    "[7m1[0m ________________________let content0\n" +
                    "[7m [0m [91m~~~~~~~~~~~~~~~~~~~~~~~~~~~[0m\n" +
                    "[96m.typicalLinguist/file0.ts[0m:[93m1[0m:[93m29[0m - [91merror[0m[90m TS1005: [0m';' expected.\n" +
                    "\n" +
                    "[7m1[0m ________________________let content0\n" +
                    "[7m [0m [91m                            ~~~~~~~~[0m\n" +
                    "[96m.typicalLinguist/file0.ts[0m:[93m1[0m:[93m29[0m - [91merror[0m[90m TS2552: [0mCannot find name 'content0'. Did you mean 'context'?\n" +
                    "\n" +
                    "[7m1[0m ________________________let content0\n" +
                    "[7m [0m [91m                            ~~~~~~~~[0m\n" +
                    "\n" +
                    "  [96m../node_modules/@types/mocha/index.d.ts[0m:[93m44[0m:[93m15[0m\n" +
                    "    [7m44[0m declare const context: Mocha.IContextDefinition;\n" +
                    "    [7m  [0m [96m              ~~~~~~~[0m\n" +
                    "    'context' is declared here.\n" +
                    "[96m.typicalLinguist/file1.ts[0m:[93m1[0m:[93m1[0m - [91merror[0m[90m TS2304: [0mCannot find name '________________________let'.\n" +
                    "\n" +
                    "[7m1[0m ________________________let content1\n" +
                    "[7m [0m [91m~~~~~~~~~~~~~~~~~~~~~~~~~~~[0m\n" +
                    "[96m.typicalLinguist/file1.ts[0m:[93m1[0m:[93m29[0m - [91merror[0m[90m TS1005: [0m';' expected.\n" +
                    "\n" +
                    "[7m1[0m ________________________let content1\n" +
                    "[7m [0m [91m                            ~~~~~~~~[0m\n" +
                    "[96m.typicalLinguist/file1.ts[0m:[93m1[0m:[93m29[0m - [91merror[0m[90m TS2552: [0mCannot find name 'content1'. Did you mean 'context'?\n" +
                    "\n" +
                    "[7m1[0m ________________________let content1\n" +
                    "[7m [0m [91m                            ~~~~~~~~[0m\n" +
                    "\n" +
                    "  [96m../node_modules/@types/mocha/index.d.ts[0m:[93m44[0m:[93m15[0m\n" +
                    "    [7m44[0m declare const context: Mocha.IContextDefinition;\n" +
                    "    [7m  [0m [96m              ~~~~~~~[0m\n" +
                    "    'context' is declared here.\n" +
                    "[96m.typicalLinguist/file2.ts[0m:[93m1[0m:[93m1[0m - [91merror[0m[90m TS2304: [0mCannot find name '________________________let'.\n" +
                    "\n" +
                    "[7m1[0m ________________________let content2\n" +
                    "[7m [0m [91m~~~~~~~~~~~~~~~~~~~~~~~~~~~[0m\n" +
                    "[96m.typicalLinguist/file2.ts[0m:[93m1[0m:[93m29[0m - [91merror[0m[90m TS1005: [0m';' expected.\n" +
                    "\n" +
                    "[7m1[0m ________________________let content2\n" +
                    "[7m [0m [91m                            ~~~~~~~~[0m\n" +
                    "[96m.typicalLinguist/file2.ts[0m:[93m1[0m:[93m29[0m - [91merror[0m[90m TS2552: [0mCannot find name 'content2'. Did you mean 'context'?\n" +
                    "\n" +
                    "[7m1[0m ________________________let content2\n" +
                    "[7m [0m [91m                            ~~~~~~~~[0m\n" +
                    "\n" +
                    "  [96m../node_modules/@types/mocha/index.d.ts[0m:[93m44[0m:[93m15[0m\n" +
                    "    [7m44[0m declare const context: Mocha.IContextDefinition;\n" +
                    "    [7m  [0m [96m              ~~~~~~~[0m\n" +
                    "    'context' is declared here.\n" +
                    "[96m.typicalLinguist/file3.ts[0m:[93m1[0m:[93m1[0m - [91merror[0m[90m TS2304: [0mCannot find name '________________________let'.\n" +
                    "\n" +
                    "[7m1[0m ________________________let content3\n" +
                    "[7m [0m [91m~~~~~~~~~~~~~~~~~~~~~~~~~~~[0m\n" +
                    "[96m.typicalLinguist/file3.ts[0m:[93m1[0m:[93m29[0m - [91merror[0m[90m TS1005: [0m';' expected.\n" +
                    "\n" +
                    "[7m1[0m ________________________let content3\n" +
                    "[7m [0m [91m                            ~~~~~~~~[0m\n" +
                    "[96m.typicalLinguist/file3.ts[0m:[93m1[0m:[93m29[0m - [91merror[0m[90m TS2552: [0mCannot find name 'content3'. Did you mean 'context'?\n" +
                    "\n" +
                    "[7m1[0m ________________________let content3\n" +
                    "[7m [0m [91m                            ~~~~~~~~[0m\n" +
                    "\n" +
                    "  [96m../node_modules/@types/mocha/index.d.ts[0m:[93m44[0m:[93m15[0m\n" +
                    "    [7m44[0m declare const context: Mocha.IContextDefinition;\n" +
                    "    [7m  [0m [96m              ~~~~~~~[0m\n" +
                    "    'context' is declared here.\n" +
                    "[96m.typicalLinguist/file4.ts[0m:[93m1[0m:[93m1[0m - [91merror[0m[90m TS2304: [0mCannot find name '________________________let'.\n" +
                    "\n" +
                    "[7m1[0m ________________________let content4\n" +
                    "[7m [0m [91m~~~~~~~~~~~~~~~~~~~~~~~~~~~[0m\n" +
                    "[96m.typicalLinguist/file4.ts[0m:[93m1[0m:[93m29[0m - [91merror[0m[90m TS1005: [0m';' expected.\n" +
                    "\n" +
                    "[7m1[0m ________________________let content4\n" +
                    "[7m [0m [91m                            ~~~~~~~~[0m\n" +
                    "[96m.typicalLinguist/file4.ts[0m:[93m1[0m:[93m29[0m - [91merror[0m[90m TS2552: [0mCannot find name 'content4'. Did you mean 'context'?\n" +
                    "\n" +
                    "[7m1[0m ________________________let content4\n" +
                    "[7m [0m [91m                            ~~~~~~~~[0m\n" +
                    "\n" +
                    "  [96m../node_modules/@types/mocha/index.d.ts[0m:[93m44[0m:[93m15[0m\n" +
                    "    [7m44[0m declare const context: Mocha.IContextDefinition;\n" +
                    "    [7m  [0m [96m              ~~~~~~~[0m\n" +
                    "    'context' is declared here.\n" +
                    "[96m.typicalLinguist/file5.ts[0m:[93m1[0m:[93m1[0m - [91merror[0m[90m TS2304: [0mCannot find name '________________________let'.\n" +
                    "\n" +
                    "[7m1[0m ________________________let content5\n" +
                    "[7m [0m [91m~~~~~~~~~~~~~~~~~~~~~~~~~~~[0m\n" +
                    "[96m.typicalLinguist/file5.ts[0m:[93m1[0m:[93m29[0m - [91merror[0m[90m TS1005: [0m';' expected.\n" +
                    "\n" +
                    "[7m1[0m ________________________let content5\n" +
                    "[7m [0m [91m                            ~~~~~~~~[0m\n" +
                    "[96m.typicalLinguist/file5.ts[0m:[93m1[0m:[93m29[0m - [91merror[0m[90m TS2304: [0mCannot find name 'content5'.\n" +
                    "\n" +
                    "[7m1[0m ________________________let content5\n" +
                    "[7m [0m [91m                            ~~~~~~~~[0m\n" +
                    "[96m.typicalLinguist/file6.ts[0m:[93m1[0m:[93m1[0m - [91merror[0m[90m TS2304: [0mCannot find name '________________________let'.\n" +
                    "\n" +
                    "[7m1[0m ________________________let content6\n" +
                    "[7m [0m [91m~~~~~~~~~~~~~~~~~~~~~~~~~~~[0m\n" +
                    "[96m.typicalLinguist/file6.ts[0m:[93m1[0m:[93m29[0m - [91merror[0m[90m TS1005: [0m';' expected.\n" +
                    "\n" +
                    "[7m1[0m ________________________let content6\n" +
                    "[7m [0m [91m                            ~~~~~~~~[0m\n" +
                    "[96m.typicalLinguist/file6.ts[0m:[93m1[0m:[93m29[0m - [91merror[0m[90m TS2304: [0mCannot find name 'content6'.\n" +
                    "\n" +
                    "[7m1[0m ________________________let content6\n" +
                    "[7m [0m [91m                            ~~~~~~~~[0m\n" +
                    "[96m.typicalLinguist/file7.ts[0m:[93m1[0m:[93m1[0m - [91merror[0m[90m TS2304: [0mCannot find name '________________________let'.\n" +
                    "\n" +
                    "[7m1[0m ________________________let content7\n" +
                    "[7m [0m [91m~~~~~~~~~~~~~~~~~~~~~~~~~~~[0m\n" +
                    "[96m.typicalLinguist/file7.ts[0m:[93m1[0m:[93m29[0m - [91merror[0m[90m TS1005: [0m';' expected.\n" +
                    "\n" +
                    "[7m1[0m ________________________let content7\n" +
                    "[7m [0m [91m                            ~~~~~~~~[0m\n" +
                    "[96m.typicalLinguist/file7.ts[0m:[93m1[0m:[93m29[0m - [91merror[0m[90m TS2304: [0mCannot find name 'content7'.\n" +
                    "\n" +
                    "[7m1[0m ________________________let content7\n" +
                    "[7m [0m [91m                            ~~~~~~~~[0m\n" +
                    "[96m.typicalLinguist/file8.ts[0m:[93m1[0m:[93m1[0m - [91merror[0m[90m TS2304: [0mCannot find name '________________________let'.\n" +
                    "\n" +
                    "[7m1[0m ________________________let content8\n" +
                    "[7m [0m [91m~~~~~~~~~~~~~~~~~~~~~~~~~~~[0m\n" +
                    "[96m.typicalLinguist/file8.ts[0m:[93m1[0m:[93m29[0m - [91merror[0m[90m TS1005: [0m';' expected.\n" +
                    "\n" +
                    "[7m1[0m ________________________let content8\n" +
                    "[7m [0m [91m                            ~~~~~~~~[0m\n" +
                    "[96m.typicalLinguist/file8.ts[0m:[93m1[0m:[93m29[0m - [91merror[0m[90m TS2304: [0mCannot find name 'content8'.\n" +
                    "\n" +
                    "[7m1[0m ________________________let content8\n" +
                    "[7m [0m [91m                            ~~~~~~~~[0m\n";

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

            const errorMessage = "Compilation failed, due to these issues: \n" +
                "\n" +
                "[96m.typicalLinguist/file0.ts[0m:[93m1[0m:[93m2[0m - [91merror[0m[90m TS2552: [0mCannot find name 'content0'. Did you mean 'context'?\n" +
                "\n" +
                "[7m1[0m  content0\n" +
                "[7m [0m [91m ~~~~~~~~[0m\n" +
                "\n" +
                "  [96m../node_modules/@types/mocha/index.d.ts[0m:[93m44[0m:[93m15[0m\n" +
                "    [7m44[0m declare const context: Mocha.IContextDefinition;\n" +
                "    [7m  [0m [96m              ~~~~~~~[0m\n" +
                "    'context' is declared here.\n";

            Then(`an error with the message: \n\t\t${errorMessage} \n\t\t should be thrown`,
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
                        expect(e.message).to.equal(errorMessage);
                    }
                },
            );

            Then(`the temporary directory should be removed`,
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
                        expect(removeDirSpy).to.have.been.calledWith(tempDirectory);
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
        sinon.spy(collectionsExtensionImport),
        sinon.spy(arrayLiteralToArray),
    ];
}

function breakingTransformFunction(sourceFile: SourceFile): SourceFile {
    const tempFile = sourceFile.copy(`./.typicalLinguist/${sourceFile.getBaseName()}`);
    tempFile.insertText(0, "________________________");
    return tempFile;
}

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

async function configureNodeModules(sandbox: Sandbox): Promise<void> {
    await writeJsonAsync("package.json", {
            dependencies: {
                "@types/node": "8.10.17",
                "typescript": "2.8.3",
            },
            main: "index.js",
            name: "sandbox",
            version: "1.0.0",
        },
    );

    const promise = spawn("npm", ["install"], {
        cwd: sandbox.path,
    });

    const errors: string[] = [];

    promise.childProcess.stderr.on("error", (data) => {
        errors.push(data.toString());
    });

    await promise;

    if (errors.length > 0) {
        throw new Error(`npm install failed ${errors}`);
    }

    await spawn("npm", ["link", "@typical-linguist/collections-extension"], {
        cwd: sandbox.path,
    });
}