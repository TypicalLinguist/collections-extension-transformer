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
    project.createWriter();

    return project.createSourceFile('./temp/sourceFile.ts', {
            bodyText: text
        }
    );
}

export function createFakeFiles(project: Project, sourceFileCount: number): SourceFile[] {
    project.getFileSystem();

    let sourceFiles: SourceFile[] = [];

    for (let i = 0; i < sourceFileCount; i++) {
        const sourceFile = project.createSourceFile(`./myfiles/file${i}.ts`, `let content${i}`)
        sourceFiles.push(sourceFile)
    }

    return sourceFiles
}

function writeCodeWith(expression: ExpressionUnderTest) {
    const typescriptWriter = new TypescriptWriter();
    return typescriptWriter
        .writeInterface(carInterfaceStructure)
        .writeLine(myCarInitializer)
        .writeLine(expression)
        .toString()
}