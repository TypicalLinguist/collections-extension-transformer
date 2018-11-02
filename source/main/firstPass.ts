import mkdirp = require("mkdirp");
import Project, {CompilerOptions, SourceFile} from "ts-simple-ast";
import {checkForErrors} from "./common";
import {TransformerSignature} from "./main";
import {copyFileSync} from "fs";
import {dirname} from "path";

export function firstPass(compilerOptions: CompilerOptions,
                          projectDirectoryPath: string,
                          rootFilePaths: ReadonlyArray<string>,
                          transforms: TransformerSignature[],
                          temporaryDirectoryPath: string,
                          removeDir: (dir: string) => void): void {

    const compiler = new Project({
        compilerOptions,
    });

    rootFilePaths.forEach((filePath) => {
        const relativeFilePath = filePath.split(`${projectDirectoryPath}/`)[1];
        const temporaryDirFilePath = `${temporaryDirectoryPath}/${relativeFilePath}`;
        mkdirp.sync(dirname(temporaryDirFilePath));
        copyFileSync(filePath, temporaryDirFilePath);
    });

    const userSourceFiles = compiler.addExistingSourceFiles(`${temporaryDirectoryPath}/**/*.ts`); // Executed before
                                                                                                  // lib.d.ts is added
    const preEmitDiagnostics = compiler.getPreEmitDiagnostics();

    if (checkForErrors(preEmitDiagnostics)) {
        removeDir(temporaryDirectoryPath);
        throw new Error("Compilation failed, due to these issues: \n\n"
            + compiler.formatDiagnosticsWithColorAndContext(preEmitDiagnostics));
    }

    executeTransforms(compiler, transforms, temporaryDirectoryPath, userSourceFiles);

    compiler.saveSync();
}

function executeTransforms(project: Project, transforms: TransformerSignature[],
                           tempDirectory: string, userSourceFiles: SourceFile[]): SourceFile[] {
    return userSourceFiles
        .map((sourceFile) => {
            transforms.forEach((transform, index) => {
                transform(sourceFile);
            });
            return sourceFile;
        });
}
