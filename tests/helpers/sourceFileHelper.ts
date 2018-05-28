import Project, {SourceFile} from "ts-simple-ast";
import {TypescriptWriter} from "./TypescriptWriter";
import {ExpressionUnderTest, myCarInitializer} from "./codeMocks";

const carInterfaceStructure = {
    name: 'Car',
    properties: [{
        name: 'gears',
        type: 'number'
    }]
};

export {writeCodeWith, createVirtualSourceFile}

function createVirtualSourceFile(text: string): SourceFile {
    const project: Project = new Project();
    project.getFileSystem();

    return project.createSourceFile('./temp/sourceFile.ts', {
            bodyText: text
        }
    );
}

function writeCodeWith(expression: ExpressionUnderTest) {
    const typescriptWriter = new TypescriptWriter();
    return typescriptWriter
        .writeInterface(carInterfaceStructure)
        .writeLine(myCarInitializer)
        .writeLine(expression)
        .toString()
}