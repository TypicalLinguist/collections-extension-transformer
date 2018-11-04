import {collectionsExtensionImport} from "../../../source/main/transforms/collectionsExtensionImport";
import {ProjectMock} from "../../helpers/ProjectMock";
import {Sandbox} from "../../helpers/Sandbox";
import {
    TestingData,
    TestingDataState,
    TypescriptDefinitionFileType,
    TypescriptFileType
} from "../../helpers/TestingData";
import {TestSuites} from "../../helpers/TestSuites";
import {executeTransformOnEverySourceFile} from "./arrayLiteralToArrayExpressionUnitTest";
import {Map} from "@typical-linguist/collections-extension";

UnitUnderTest(`collectionsExtensionImport`, function(): void {
    Given(`source files that contain new Array() expressions`, function(): void {
        const testingData = new TestingData(TestSuites.CollectionsExtensionImport);
        const projectMock = new ProjectMock();
        const sandbox = new Sandbox(testingData, projectMock);
        let expectedTypescriptFiles: Map<string, string>;
        let initialFiles: Map<string, string>;
        let expectTypescriptDefinitionFiles: Map<string, string>;

        beforeEach(async function(): Promise<any> {
            let initialTypescriptFiles: Map<string, string>;
            let initialTypescriptDefinitionFiles: Map<string, string>;

            this.timeout(25000);
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

        When(`the collectionsExtensionImport() function is executed on each file`, function(): void {
            let actualFiles: Map<string, string>;
            let actualTypescriptFiles: Map<string, string>;
            let actualTypescriptDefinitionFiles: Map<string, string>;

            beforeEach(async function(): Promise<any> {
                actualFiles = executeTransformOnEverySourceFile(
                    initialFiles,
                    collectionsExtensionImport,
                );

                actualTypescriptFiles = actualFiles
                    .filter((fileContent, filename) =>
                        filename.endsWith(`.${TypescriptFileType.Instance.extension}`) &&
                        !filename.endsWith(`.${TypescriptDefinitionFileType.Instance.extension}`),
                    );

                actualTypescriptDefinitionFiles = actualFiles
                    .filter((fileContent, filename) =>
                        filename.endsWith(`.${TypescriptDefinitionFileType.Instance.extension}`));
            });

            Then(`then '@typical-linguist/collections-extension' module import should be added ` +
                `to files containing the new Array() expression`,
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
