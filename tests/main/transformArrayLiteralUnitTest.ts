import {transformTypescript} from "../../source/main/transformTypescript";
import Project, {SourceFile} from "ts-simple-ast";
import {TypescriptWriter} from "../helpers/TypescriptWriter";

UnitUnderTest(`transformTypescript`, function () {
    Given(`A project that contains a source file that contains an array literal`, function () {
        let sourceFile: SourceFile, expectedFileContent: string;

        beforeEach(function () {
            const project: Project = new Project();
            project.getFileSystem();
            sourceFile = createVirtualSourceFile(project);
            expectedFileContent = writeCodeWith(newArrayExpression)
        });

        When(`transform is executed`, function () {
            let outputFileContent: string;

            beforeEach(function () {
                outputFileContent = transformTypescript(sourceFile).getText()
            });

            Then(`the array literal should have been transformed to a new Array() expression`, function () {
                expect(outputFileContent).to.equal(expectedFileContent)
            })
        })
    });
});

const carInterface = {
    name: 'Car',
    properties: [{
        name: 'gears',
        type: 'number'
    }]
};

const myCarInitializer = 'let myCar: Car = { gears: 6 };';
const arrayLiteral = "let a = [1, 2, [4, 5], 'monkey', myCar];";
const newArrayExpression = `let a = new Array<1 | 2 | number[] | "monkey" | Car>(1, 2, [4, 5], 'monkey', myCar);`;

type ExpressionUnderTest = typeof arrayLiteral | typeof newArrayExpression;

function writeCodeWith(expression: ExpressionUnderTest) {
    const typescriptWriter = new TypescriptWriter();
    return typescriptWriter
        .writeInterface(carInterface)
        .writeLine(myCarInitializer)
        .writeLine(arrayLiteral)
        .toString()
}

function createVirtualSourceFile(project: Project) {
    return project.createSourceFile('./temp/sourceFile.ts', {
            bodyText: writeCodeWith(arrayLiteral)
        }
    );
}