import mkdirp = require("mkdirp");
import Project, {CompilerOptions, SourceFile} from "ts-simple-ast";
import {checkForErrors} from "./common";
import {TransformerSignature} from "./main";
import {copyFileSync} from "fs";
import {dirname} from "path";

export function transformTypescript(compilerOptions: CompilerOptions,
                                    projectDirectoryPath: string,
                                    rootFilePaths: ReadonlyArray<string>,
                                    transforms: TransformerSignature[],
                                    temporaryDirectoryPath: string,
                                    removeDir: (dir: string) => void): void {

    moveFilesToTemporaryDirectory(rootFilePaths, projectDirectoryPath, temporaryDirectoryPath);
    const compiler = configureCompiler(compilerOptions);

    const userSourceFiles = compiler.addExistingSourceFiles(`${temporaryDirectoryPath}/**/*.ts`);

    ifSyntacticalErrorsThrow(compiler, removeDir, temporaryDirectoryPath);

    executeTransforms(transforms, userSourceFiles);

    compiler.saveSync();
}

function executeTransforms(transforms: TransformerSignature[],
                           userSourceFiles: SourceFile[]): void {
    userSourceFiles
        .forEach((sourceFile) => {
            transforms.forEach((transform) => {
                transform(sourceFile);
            });
        });
}

function ifSyntacticalErrorsThrow(compiler: Project,
                                  removeDir: (dir: string) => void,
                                  temporaryDirectoryPath: string): void {

    const preEmitDiagnostics = compiler.getPreEmitDiagnostics();

    if (checkForErrors(preEmitDiagnostics)) {
        removeDir(temporaryDirectoryPath);
        throw new Error("Compilation failed, due to these issues: \n\n"
            + compiler.formatDiagnosticsWithColorAndContext(preEmitDiagnostics));
    }
}

function moveFilesToTemporaryDirectory(rootFilePaths: ReadonlyArray<string>,
                                       projectDirectoryPath: string,
                                       temporaryDirectoryPath: string): void {
    rootFilePaths.forEach((filePath) => {
        const relativeFilePath = filePath.split(`${projectDirectoryPath}/`)[1];
        const temporaryDirFilePath = `${temporaryDirectoryPath}/${relativeFilePath}`;
        mkdirp.sync(dirname(temporaryDirFilePath));
        copyFileSync(filePath, temporaryDirFilePath);
    });
}

function configureCompiler(compilerOptions: CompilerOptions): Project {
    const compiler = new Project({
        compilerOptions,
    });
    return compiler;
}
