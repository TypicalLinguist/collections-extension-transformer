import {copyFileSync, existsSync, mkdirSync} from "fs";
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
                     tempDirectoryPath: string = `${projectDirectoryPath}/.typicalLinguist`): void {

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

    if (!existsSync(compilerOptions.outDir)) {
        mkdirSync(compilerOptions.outDir);
    }

    if (hasInitialErrors) {
        process.exit(1);
    }

    process.on("exit", function(): void {
        secondPass(tempDirectoryPath, hasInitialErrors, removeDir, compilerOptions);
    });
}

export type TransformerSignature = (sourceFile: SourceFile) => SourceFile;
