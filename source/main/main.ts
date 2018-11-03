import {mkdirSync} from "fs";
import {removeSync} from "fs-extra-promise";
import {CompilerOptions, SourceFile, ts} from "ts-simple-ast";
import {PluginConfig} from "ttypescript/lib/PluginCreator";
import {transformTypescript} from "./transformTypescript";
import {compileTransformedTypeScript} from "./compileTransformedTypeScript";
import {arrayLiteralToNewArrayExpression} from "./transforms/arrayLiteralToNewArrayExpression";
import {collectionsExtensionImport} from "./transforms/collectionsExtensionImport";

export default function(program: ts.Program, config?: PluginConfig)
    : (ctx: ts.TransformationContext) => (sourceFile: ts.SourceFile) => ts.SourceFile {

    const projectDirectoryPath = program.getCurrentDirectory();
    const compilerOptions = program.getCompilerOptions();
    const rootFilePaths = program.getRootFileNames();
    const removeDirFunction = config.removeDirFunction ? config.removeDirFunction : removeSync;

    const transforms = [
        collectionsExtensionImport,
        arrayLiteralToNewArrayExpression,
    ];

    main(projectDirectoryPath,
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
                     tempDirectoryPath: string = `${projectDirectoryPath}/.typicalLinguist`): void {

    mkdirSync(tempDirectoryPath);

    transformTypescript(compilerOptions, projectDirectoryPath, rootFilePaths, transforms, tempDirectoryPath, removeDir);

    process.on("exit", function(): void {
        compileTransformedTypeScript(tempDirectoryPath, removeDir, compilerOptions);
    });
}

export type TransformerSignature = (sourceFile: SourceFile) => SourceFile;
