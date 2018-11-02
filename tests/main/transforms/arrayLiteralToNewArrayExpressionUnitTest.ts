import {TransformerSignature} from "../../../source/main/main";
import {arrayLiteralToNewArrayExpression} from "../../../source/main/transforms/arrayLiteralToNewArrayExpression";
import {ProjectMock} from "../../helpers/ProjectMock";
import {Sandbox} from "../../helpers/Sandbox";
import {createVirtualSourceFileWithContent} from "../../helpers/sourceFileMockHelper";
import {
    TestingData,
    TestingDataState,
    TypescriptDefinitionFileType,
    TypescriptFileType,
} from "../../helpers/TestingData";
import {TestSuites} from "../../helpers/TestSuites";
import {Map} from "@typical-linguist/collections-extension";

UnitUnderTest(`arrayLiteralToNewArrayExpression`, function(): void {
    beforeEach(function() {
        this.timeout(60000);
    });
    Given(`source files that contain an array literal`, async function(): Promise<any> {
        const testingData = new TestingData(TestSuites.ArrayLiteralToNewArrayExpression);
        const projectMock = new ProjectMock();
        const sandbox = new Sandbox(testingData, projectMock);
        let expectedTypescriptFiles: Map<string, string>;
        let initialFiles: Map<string, string>;
        let expectTypescriptDefinitionFiles: Map<string, string>;

        beforeEach(async function(): Promise<any> {
            let initialTypescriptFiles: Map<string, string>;
            let initialTypescriptDefinitionFiles: Map<string, string>;
            await sandbox.setup();
            expectedTypescriptFiles = await testingData
                .getFiles(TestingDataState.EXPECTED, TypescriptFileType.Instance);
            initialTypescriptFiles = await testingData
                .getFiles(TestingDataState.INITIAL, TypescriptFileType.Instance);
            expectTypescriptDefinitionFiles = await testingData
                .getFiles(TestingDataState.EXPECTED, TypescriptDefinitionFileType.Instance);
            initialTypescriptDefinitionFiles = await testingData
                .getFiles(TestingDataState.INITIAL, TypescriptDefinitionFileType.Instance);

            initialFiles = initialTypescriptFiles.concat(initialTypescriptDefinitionFiles);
        });

        When(`the arrayLiteralToNewArrayExpression() function is executed on each file`, function(): void {
            let actualFiles: Map<string, string>;
            let actualTypescriptFiles: Map<string, string>;
            let actualTypescriptDefinitionFiles: Map<string, string>;

            beforeEach(function(): void {
                actualFiles = executeTransformOnEverySourceFile(
                    initialFiles,
                    arrayLiteralToNewArrayExpression,
                );

                actualTypescriptFiles = actualFiles
                    .filter(getTypeScriptFiles);

                actualTypescriptDefinitionFiles = actualFiles
                    .filter((fileContent, filename) =>
                        filename.endsWith(`.${TypescriptDefinitionFileType.Instance.extension}`));
            });

            Then(`all the array literals should have been transformed to a new Array() expression`,
                function(): void {
                    expect(actualTypescriptFiles).files.to.equal(expectedTypescriptFiles);
                },
            );

            Then(`typescript definition files should not be affected by transform`,
                function(): void {
                    expect(actualTypescriptDefinitionFiles).files.to.equal(expectTypescriptDefinitionFiles);
                },
            );
        });

        afterEach(async function(): Promise<any> {
            await sandbox.tearDown();
        });
    });
});

export function executeTransformOnEverySourceFile(
    initialTypescriptFiles: Map<string, string>,
    transformFunc: TransformerSignature): Map<string, string> {

    const actualFiles: Map<string, string> = new Map<string, string>();
    initialTypescriptFiles.forEach((fileContent, fileName) => {
        const sourceFile = createVirtualSourceFileWithContent(fileName, fileContent);
        const transformedSourceFile = transformFunc(sourceFile).getText();
        actualFiles.set(fileName, transformedSourceFile);
    });

    return actualFiles;
}

function getTypeScriptFiles(fileContent: string, filename: string): boolean {
    const isTypescriptFile = filename.endsWith(`.${TypescriptFileType.Instance.extension}`);
    const isTypescriptDefinitionFile = filename.endsWith(`.${TypescriptDefinitionFileType.Instance.extension}`);
    return isTypescriptFile && !isTypescriptDefinitionFile;
}
