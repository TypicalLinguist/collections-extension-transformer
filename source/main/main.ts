import {copyFileSync, mkdirSync, Stats, unwatchFile, watchFile} from "fs";
import {removeSync} from "fs-extra-promise";
import Project, {CompilerOptions, SourceFile, ts} from "ts-simple-ast";
import {PluginConfig} from "ttypescript/lib/PluginCreator";
import {firstPass} from "./firstPass";
import {secondPass} from "./secondPass";
import {arrayLiteralToNewArrayExpression} from "./transforms/arrayLiteralToNewArrayExpression";
import {collectionsExtensionImport} from "./transforms/collectionsExtensionImport";

export default function(program: ts.Program, config?: PluginConfig)
    : (ctx: ts.TransformationContext) => (sourceFile: ts.SourceFile) => ts.SourceFile {

    const projectDirectory = program.getCurrentDirectory();
    const compilerOptions = program.getCompilerOptions();
    const rootFilePaths = program.getRootFileNames();
    const removeDirFunction = config.removeDirFunction ? config.removeDirFunction : removeSync;

    const transforms = [
        arrayLiteralToNewArrayExpression,
        collectionsExtensionImport,
    ];

    main(projectDirectory,
        rootFilePaths,
        compilerOptions,
        transforms,
        removeDirFunction);

    return (ctx: ts.TransformationContext) => {
        return (sourceFile: ts.SourceFile) => {
            return sourceFile;
        };
    };
}

export function main(projectDirectoryPath: string,
                     rootFilePaths: ReadonlyArray<string>,
                     compilerOptions: CompilerOptions,
                     transforms: TransformerSignature[],
                     removeDir: (dir: string) => void,
                     tempDirectoryPath: string = `${projectDirectoryPath}/.typicalLinguist`): Promise<SourceFile[]> {

    mkdirSync(tempDirectoryPath);

    const project = new Project({
        compilerOptions,
    });

    rootFilePaths.forEach((filePath) => {
        const relativeFilePath = filePath.split(`${projectDirectoryPath}/`)[1];
        const temporaryDirFilePath = `${tempDirectoryPath}/${relativeFilePath}`;
        copyFileSync(filePath, temporaryDirFilePath);
        project.addExistingSourceFile(temporaryDirFilePath);
    });

    const hasInitialErrors = firstPass(project, transforms, tempDirectoryPath);

    let lastChange = 0;

    mkdirSync(compilerOptions.outDir);

    const result = new Promise<SourceFile[]>((resolve, reject) => {
        watchFile(compilerOptions.outDir, function(curr: Stats, prev: Stats): void {
            lastChange = prev.mtime.getTime() - curr.mtime.getTime();
        });

        const intervalId = setInterval(function(): void {
            const timeDiff = (Date.now() - lastChange) / 1000;
            if (timeDiff > 30) {
                unwatchFile(compilerOptions.outDir);
                removeDir(compilerOptions.outDir);
                try {
                    clearInterval(intervalId);
                    const sourceFiles = secondPass(tempDirectoryPath, hasInitialErrors, removeDir, compilerOptions);
                    resolve(sourceFiles);
                } catch (e) {
                    reject(e);
                }
            }
        }, 10000);
    });

    if (hasInitialErrors) {
        process.exit(1);
    }

    return result;
}

export type TransformerSignature = (sourcefile: SourceFile) => SourceFile;
