import {Program} from "ts-simple-ast";
import {default as transformer} from "../../source/main";
import {ProjectMock} from "../helpers/ProjectMock";
import {Sandbox} from "../helpers/Sandbox";
import {TestingData} from "../helpers/TestingData";
import {TestSuites} from "../helpers/TestSuites";

UnitUnderTest(`transformer`, () => {
    Given(`A existing program`, () => {
        const testingData = new TestingData(TestSuites.TransformAll);
        const projectMock = new ProjectMock();
        const sandbox = new Sandbox(testingData, projectMock);
        let expectedTypescriptFiles: Map<string, string>;
        let initialTypescriptFiles: Map<string, string>;
        let fakeProgram: Program;

        beforeEach(async function(): Promise<any> {
            this.timeout(25000);
            await sandbox.setup();
            expectedTypescriptFiles = await testingData.getExpectedTypescriptFiles();
            initialTypescriptFiles = await testingData.getInitialTypescriptFiles();
            fakeProgram = await projectMock.getProgram();
            transformer(fakeProgram.compilerObject);
        });

        When(`the transformer function is executed on that program`, () => {
            Then(`it should compile and transform the files in that program`, async function(): Promise<any> {
                const actualTypescriptFiles = await testingData.getActualTypescriptFiles();
                expect(actualTypescriptFiles).files.to.equal(expectedTypescriptFiles);
            });
        });

        afterEach(async function(): Promise<any> {
            await sandbox.tearDown();
        });
    });
});
