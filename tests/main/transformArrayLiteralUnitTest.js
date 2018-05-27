"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transformTypescript_1 = require("../../source/main/transformTypescript");
const ts_simple_ast_1 = require("ts-simple-ast");
UnitUnderTest(`transformTypescript`, function () {
    Given(`A project that contains a source file that contains an array literal`, function () {
        let sourceFile, expectedFileContent;
        beforeEach(function () {
            const project = new ts_simple_ast_1.default();
            const codeBlockWriter = project.createWriter();
            project.getFileSystem();
            console.log(Object.getOwnPropertyNames(project.global));
            sourceFile = createVirtualSourceFile(project);
            expectedFileContent = writeCodeWithArrayLiteral(codeBlockWriter);
        });
        When(`transform is executed`, function () {
            let outputFileContent;
            beforeEach(function () {
                outputFileContent = transformTypescript_1.transformTypescript(sourceFile).getText();
            });
            Then(`the array literal should have been transformed to a new Array() expression`, function () {
                expect(outputFileContent).to.equal(expectedFileContent);
            });
        });
    });
});
class TypescriptWriter extends ts_simple_ast_1.CodeBlockWriter {
    writeInterface(structure) {
        this.writeLine(`interface ${structure.name}`)
            .block(() => {
            structure.properties.forEach(({ name, type }) => {
                this.writeLine(`${name} : ${type}`);
            });
        });
        return this;
    }
}
//
// enum PrimativeTypes {
//     NUMBER = 'number',
//     STRING = 'string',
//     BOOLEAN = 'boolean'
// }
//
// const carInterface: InterfaceDeclarationStructure = {
//     name: 'Car',
//     properties: [{
//         name: 'gears',
//         type: 'number'
//     }]
// };
//
// console.log(JSON.stringify(carInterface, null, 2));
function writeInitialCode() {
    return (codeWriter) => codeWriter
        .write('interface Car')
        .block(() => {
        codeWriter.writeLine('gears: number');
    })
        .writeLine('let myCar: Car = { gears: 6 };')
        .writeLine("let a = [1, 2, [4, 5], 'monkey', myCar];");
}
function writeCodeWithArrayLiteral(codeBlockWriter) {
    return codeBlockWriter
        .write('interface Car')
        .block(() => {
        codeBlockWriter.writeLine('gears: number');
    })
        .writeLine('let myCar: Car = { gears: 6 };')
        .writeLine(`let a = new Array<1 | 2 | number[] | "monkey" | Car>(1, 2, [4, 5], 'monkey', myCar);`)
        .toString();
}
function createVirtualSourceFile(project) {
    return project.createSourceFile('./temp/sourceFile.ts', {
        bodyText: writeInitialCode()
    });
}
//# sourceMappingURL=transformArrayLiteralUnitTest.js.map