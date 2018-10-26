import flatten = require("lodash.flatten"); // <== you got to appreciate the irony
import Project, {SourceFile} from "ts-simple-ast";
import {checkForErrors} from "./common";
import {TransformerSignature} from "./main";

export function firstPass(project: Project, transforms: TransformerSignature[], tempDirectory: string): boolean {
    const userSourceFiles = getUserSourceFiles(project); // Executed before lib.d.ts is added

    const initialErrorMessages = checkForErrors(
        project.getPreEmitDiagnostics(),
    );

    const sourceFiles = executeTransforms(project, transforms, tempDirectory, userSourceFiles);

    const hasInitialErrors = initialErrorMessages.length > 0;

    project.saveSync();

    return hasInitialErrors;
}

function getUserSourceFiles(project: Project): SourceFile[] {
    return flatten(project
        .getRootDirectories()
        .map((dir) => dir.getDescendantSourceFiles()),
    );
}

function executeTransforms(project: Project, transforms: TransformerSignature[],
                           tempDirectory: string, userSourceFiles: SourceFile[]): SourceFile[] {
    return userSourceFiles
        .map((sourceFile) => {
            transforms.forEach((transform) => {
                transform(sourceFile);
            });
            return sourceFile;
        });
}
