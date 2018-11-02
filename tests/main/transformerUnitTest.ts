import {Program} from "ts-simple-ast";
import {default as transformer} from "../../source/main";
import {ProjectMock} from "../helpers/ProjectMock";
import {Sandbox} from "../helpers/Sandbox";
import {TestingData, TestingDataState, TypescriptDefinitionFileType, TypescriptFileType} from "../helpers/TestingData";
import {TestSuites} from "../helpers/TestSuites";
import {Map} from "@typical-linguist/collections-extension";

UnitUnderTest(`transformer`, () => {
    Given(`An existing program`, () => {
        const testingData = new TestingData(TestSuites.TransformAll);
        const projectMock = new ProjectMock();
        const sandbox = new Sandbox(testingData, projectMock);
        let expectedTypescriptFiles: Map<string, string>;
        let expectTypescriptDefinitionFiles: Map<string, string>;
        let initialFiles: Map<string, string>;
        let fakeProgram: Program;

        beforeEach(async function(): Promise<void> {
            this.timeout(50000);
            await sandbox.setup();
            let initialTypescriptFiles: Map<string, string>;
            let initialTypescriptDefinitionFiles: Map<string, string>;

            expectedTypescriptFiles = await testingData
                .getFiles(TestingDataState.EXPECTED, TypescriptFileType.Instance);
            initialTypescriptFiles = await testingData
                .getFiles(TestingDataState.INITIAL, TypescriptFileType.Instance);
            expectTypescriptDefinitionFiles = await testingData
                .getFiles(TestingDataState.EXPECTED, TypescriptDefinitionFileType.Instance);
            initialTypescriptDefinitionFiles = await testingData
                .getFiles(TestingDataState.INITIAL, TypescriptDefinitionFileType.Instance);

            initialFiles = initialTypescriptFiles.concat(initialTypescriptDefinitionFiles);

            fakeProgram = await projectMock.getProgram();

            sandbox.mockProcessEventHandler();

            transformer(fakeProgram.compilerObject, {
                removeDirFunction: function fakeRemoveSync(dir: string): void {
                    "empty";
                },
            });

            sandbox.emitFakeProcessExitEvent();
        });

        When(`the transformer function is executed on that program`, () => {
            Then(`it should compile and transform the files in that program`, async function(): Promise<any> {
                const actualFiles = await testingData
                    .getFiles(TestingDataState.ACTUAL, TypescriptFileType.Instance);
                const actualTypescriptFiles = actualFiles
                    .filter((fileContent, filename) =>
                        filename.endsWith(`.${TypescriptFileType.Instance.extension}`) &&
                        !filename.endsWith(`.${TypescriptDefinitionFileType.Instance.extension}`),
                    );

                expect(actualTypescriptFiles).files.to.equal(expectedTypescriptFiles);
            });
        });

        afterEach(async function(): Promise<any> {
            await sandbox.tearDown();
        });
    });
});
