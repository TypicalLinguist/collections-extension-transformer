import Project, {SourceFile} from "ts-simple-ast";
import {writeFileSync} from "fs";

export {
    createVirtualSourceFileWithContent,
    createSourceFiles,
};

function createVirtualSourceFileWithContent(name: string, content: string): SourceFile {
    const project: Project = new Project();

    return project.createSourceFile(name, {
            bodyText: content,
        },
    );
}

function createSourceFiles(projectDirectoryPath: string, sourceFileCount: number,
                           withErrors: boolean = false): string[] {

    const filePaths: string[] = [];
    for (let i = 0; i < sourceFileCount; i++) {
        const filePath = createSourceFile(projectDirectoryPath, i, withErrors);
        filePaths.push(filePath);
    }

    return filePaths;
}

function createSourceFile(projectDirectoryPath: string, i: number, withErrors: boolean): string {
    const letKeyword = withErrors ? "" : "let";
    const filePath = `${projectDirectoryPath}/file${i}.ts`;
    writeFileSync(filePath, `${letKeyword} content${i}`);
    return filePath;
}
