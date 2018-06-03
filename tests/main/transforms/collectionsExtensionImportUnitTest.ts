import {collectionsExtensionImport} from "../../../source/main/transforms/collectionsExtensionImport";
import {ProjectMock} from "../../helpers/ProjectMock";
import {Sandbox} from "../../helpers/Sandbox";
import {TestingData} from "../../helpers/TestingData";
import {TestSuites} from "../../helpers/TestSuites";
import {executeTransformOnEverySourceFile} from "./arrayLiteralToNewArrayExpressionUnitTest";

UnitUnderTest(`collectionsExtensionImport`, function(): void {
    Given(`source files that contain new Array() expressions`, function(): void {
        const testingData = new TestingData(TestSuites.CollectionsExtensionImport);
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

        When(`the collectionsExtensionImport() function is executed on each file`, function(): void {
            let actualFiles: Map<string, string>;

            beforeEach(async function(): Promise<any> {
                actualFiles = executeTransformOnEverySourceFile(
                    initialTypescriptFiles,
                    collectionsExtensionImport,
                );
            });

            Then(`then '@typical-linguist/collections-extension' module import should be added ` +
                `to files containing the new Array() expression`,
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
