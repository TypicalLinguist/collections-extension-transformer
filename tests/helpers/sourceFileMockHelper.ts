import Project, {SourceFile} from "ts-simple-ast";

export {
    createVirtualSourceFileWithContent,
    createVirtualSourceFiles,
};

function createVirtualSourceFileWithContent(name: string, content: string): SourceFile {
    const project: Project = new Project();

    return project.createSourceFile(name, {
            bodyText: content,
        },
    );
}

function createVirtualSourceFiles(project: Project, sourceFileCount: number,
                                  withErrors: boolean = false): SourceFile[] {

    const sourceFiles: SourceFile[] = [];
    for (let i = 0; i < sourceFileCount; i++) {
        const sourceFile = createSourceFile(project, i, withErrors);
        sourceFiles.push(sourceFile);
    }

    return sourceFiles;
}

function createSourceFile(project: Project, i: number, withErrors: boolean): SourceFile {
    const letKeyword = withErrors ? "" : "let";
    return project.createSourceFile(`./myfiles/otherFiles/file${i}.ts`, `${letKeyword} content${i}`);
}
