import {mkdirSync, Stats, unwatchFile, watchFile} from "fs";
import {removeSync} from "fs-extra-promise";
import Project, {SourceFile, ts} from "ts-simple-ast";
import {PluginConfig} from "ttypescript/lib/PluginCreator";
import {firstPass} from "./firstPass";
import {secondPass} from "./secondPass";
import {arrayLiteralToNewArrayExpression} from "./transforms/arrayLiteralToNewArrayExpression";
import {collectionsExtensionImport} from "./transforms/collectionsExtensionImport";

export default function(program: ts.Program, config?: PluginConfig)
    : (ctx: ts.TransformationContext) => (sourceFile: ts.SourceFile) => ts.SourceFile {

    const project = new Project({
        compilerOptions: program.getCompilerOptions(),
    });

    program.getRootFileNames().forEach((fileName) => {
        project.addExistingSourceFile(fileName);
    });

    main(project, [
            arrayLiteralToNewArrayExpression,
            collectionsExtensionImport,
        ], config.removeDirFunction ? config.removeDirFunction : removeSync,
        `${program.getCurrentDirectory()}/.typicalLinguist`);

    return (ctx: ts.TransformationContext) => {
        return (sourceFile: ts.SourceFile) => {
            return sourceFile;
        };
    };
}

export function main(project: Project, transforms: TransformerSignature[], removeDir: (dir: string) => void,
                     tempDirectory: string = `${process.cwd()}/.typicalLinguist`): Promise<SourceFile[]> {

    const hasInitialErrors = firstPass(project, transforms, tempDirectory);
    const compilerOptions = project.getCompilerOptions();

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
                    const sourceFiles = secondPass(tempDirectory, hasInitialErrors, removeDir, compilerOptions);
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
