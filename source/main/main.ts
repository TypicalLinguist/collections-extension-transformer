import Project, {SourceFile} from "ts-simple-ast";

export type TransformSignature = (sourcefile: SourceFile) => SourceFile;

export function main(project: Project, transforms: TransformSignature[]) {
    const sourceFiles = project.getSourceFiles().map(sourceFile => {
        const baseName = sourceFile.getBaseName();
        const tempSourceFile = sourceFile.copy(`./.typicalLinguist/${baseName}`);
        transforms.forEach(transform => transform(tempSourceFile));
        project.removeSourceFile(sourceFile);
        return tempSourceFile;
    });

    project.saveSync();

    const compiler = new Project();
    compiler.addExistingSourceFiles('.typicalLinguist/**/*.ts');

    const emitResult = compiler.emit();

    return sourceFiles;
}



