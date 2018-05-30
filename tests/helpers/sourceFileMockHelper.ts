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

export {
    writeCodeWith,
    createVirtualSourceFileWithContent,
    createVirtualSourceFiles
}

function createVirtualSourceFileWithContent(content: string): SourceFile {
    const project: Project = new Project();

    return project.createSourceFile('./temp/sourceFile.ts', {
            bodyText: content
        }
    );
}

function createVirtualSourceFiles(project: Project, sourceFileCount: number, withErrors: boolean = false): SourceFile[] {
    let sourceFiles: SourceFile[] = [];
    for (let i = 0; i < sourceFileCount; i++) {
        const sourceFile = createSourceFile(project, i, withErrors);
        sourceFiles.push(sourceFile)
    }

    return sourceFiles
}

function createSourceFile(project: Project, i: number, withErrors: boolean) {
    const letKeyword = withErrors ? '' : 'let';
    return project.createSourceFile(`./myfiles/otherFiles/file${i}.ts`, `${letKeyword} content${i}`);
}


function writeCodeWith(expression: ExpressionUnderTest) {
    const typescriptWriter = new TypescriptWriter();
    return typescriptWriter
        .writeInterface(carInterfaceStructure)
        .writeLine(myCarInitializer)
        .writeLine(expression)
        .toString()
}