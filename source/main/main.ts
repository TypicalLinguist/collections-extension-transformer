import Project, {SourceFile, ts} from "ts-simple-ast";
import "ttypescript";
import {firstPass} from "./firstPass";
import {secondPass} from "./secondPass";
import {arrayLiteralToNewArrayExpression} from "./transforms/arrayLiteralToNewArrayExpression";
import {collectionsExtensionImport} from "./transforms/collectionsExtensionImport";

export default function(program: ts.Program)
    : (ctx: ts.TransformationContext) => (sourceFile: ts.SourceFile) => ts.SourceFile {

    const project = new Project();

    program.getRootFileNames().forEach((fileName) => {
        project.addExistingSourceFile(fileName);
    });

    main(project, [
        arrayLiteralToNewArrayExpression,
        collectionsExtensionImport,
    ], `${program.getCurrentDirectory()}/.typicalLinguist`);

    return (ctx: ts.TransformationContext) => {
        return (sourceFile: ts.SourceFile) => {
            return sourceFile;
        };
    };
}

export function main(project: Project, transforms: TransformerSignature[],
                     tempDirectory: string = `${process.cwd()}/.typicalLinguist`): SourceFile[] {

    const hasInitialErrors = firstPass(project, transforms, tempDirectory);
    const sourceFiles = secondPass(tempDirectory, hasInitialErrors);

    if (hasInitialErrors) {
        process.exit(1);
    }

    return sourceFiles;
}

export type TransformerSignature = (sourcefile: SourceFile) => SourceFile;
