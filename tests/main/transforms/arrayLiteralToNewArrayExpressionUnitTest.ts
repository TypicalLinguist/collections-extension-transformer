import {TransformerSignature} from "../../../source/main/main";
import {arrayLiteralToNewArrayExpression} from "../../../source/main/transforms/arrayLiteralToNewArrayExpression";
import {ProjectMock} from "../../helpers/ProjectMock";
import {Sandbox} from "../../helpers/Sandbox";
import {createVirtualSourceFileWithContent} from "../../helpers/sourceFileMockHelper";
import {TestingData} from "../../helpers/TestingData";
import {TestSuites} from "../../helpers/TestSuites";

UnitUnderTest(`arrayLiteralToNewArrayExpression`, function(): void {
    Given(`source files that contain an array literal`, async function(): Promise<any> {
        const testingData = new TestingData(TestSuites.ArrayLiteralToNewArrayExpression);
        const projectMock = new ProjectMock();
        const sandbox = new Sandbox(testingData, projectMock);
        let expectedTypescriptFiles: Map<string, string>;
        let initialTypescriptFiles: Map<string, string>;

        beforeEach(async function(): Promise<any> {
            this.timeout(25000);
            await sandbox.setup();
            expectedTypescriptFiles = await testingData.getExpectedTypescriptFiles();
            initialTypescriptFiles = await testingData.getInitialTypescriptFiles();
        });

        When(`the arrayLiteralToNewArrayExpression() function is executed on each file`, function(): void {
            let actualFiles: Map<string, string>;

            beforeEach(async function(): Promise<any> {
                actualFiles = executeTransformOnEverySourceFile(
                    initialTypescriptFiles,
                    arrayLiteralToNewArrayExpression,
                );
            });

            Then(`all the array literals should have been transformed to a new Array() expression`,
                function(): void {
                    expect(actualFiles).files.to.equal(expectedTypescriptFiles);
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
        actualFiles.set(fileName, transformFunc(sourceFile).getText());
    });

    return actualFiles;
}
