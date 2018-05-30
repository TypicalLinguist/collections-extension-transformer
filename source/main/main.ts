import Project, {Diagnostic, DiagnosticCategory, DiagnosticMessageChain, SourceFile} from "ts-simple-ast";
import flatten = require('lodash.flatten'); //<== you got to appreciate the irony

export {main, TransformerSignature, createErrorMessageFromTemplate}

function main(project: Project, transforms: TransformerSignature[], tempDirectory: string = `${process.cwd()}/.typicalLinguist`) {
    const userSourceFiles = getUserSourceFiles(project); //Executed before lib.d.ts is added

    const initialErrorMessages = checkForErrors(
        project.getPreEmitDiagnostics()
    );

    const hasInitialErrors = initialErrorMessages.length > 0;

    const sourceFiles = executeTransformsAndSave(project, transforms, tempDirectory, userSourceFiles);
    compileAndEmit(tempDirectory, hasInitialErrors);

    if (hasInitialErrors) {
        process.exit(1);
    }

    return sourceFiles;
}

type TransformerSignature = (sourcefile: SourceFile) => SourceFile;

function getUserSourceFiles(project: Project): SourceFile[] {
    return flatten(project
        .getRootDirectories()
        .map(dir => dir.getDescendantSourceFiles())
    );
}

function executeTransformsAndSave(project: Project, transforms: TransformerSignature[], tempDirectory: string, userSourceFiles: SourceFile[]) {
    const sourceFiles = executeTransforms(project, transforms, tempDirectory, userSourceFiles);
    project.saveSync();
    return sourceFiles;
}

function compileAndEmit(tempDirectory: string, hasInitialErrorMessages: boolean) {
    const compiler = new Project();

    const sourceFiles = compiler.addExistingSourceFiles(`${tempDirectory}/**/*.ts`);

    const moreErrorMessages = checkForErrors(
        compiler.getDiagnostics()
    );

    const hasCompileErrorMessages = moreErrorMessages.length > 0;

    if (!hasInitialErrorMessages && hasCompileErrorMessages) {
        throw new Error(createErrorMessageFromTemplate(moreErrorMessages))
    }

    const emitResult = compiler.emit();
}

function executeTransforms(project: Project, transforms: TransformerSignature[], tempDirectory: string, userSourceFiles: SourceFile[]) {
    return userSourceFiles
        .map(sourceFile => {
            const baseName = sourceFile.getBaseName();
            const tempSourceFile = sourceFile.copy(`${tempDirectory}/${baseName}`);
            transforms.forEach(transform => transform(tempSourceFile));
            project.removeSourceFile(sourceFile);
            return tempSourceFile;
        });
}

function extractErrorMessage(diagnostic: Diagnostic): string {
    let message = diagnostic.getMessageText();

    if (message instanceof DiagnosticMessageChain) {
        const diagnosticMessageChain = message as DiagnosticMessageChain;
        message = diagnosticMessageChain.getMessageText();
    }

    return message;
}

function hasError(diagnostic: Diagnostic) {
    return diagnostic.getCategory() === DiagnosticCategory.Error;
}

function checkForErrors(diagnostics: Diagnostic[]) {
    return diagnostics.map(diagnostic => {
        if (hasError(diagnostic)) {
            return extractErrorMessage(diagnostic)
        } else {
            return undefined
        }
    }).filter(message => message !== undefined);
}

function createErrorMessageFromTemplate(errorMessages: string[]) {
    const plugin = `collection-extension-transformer`;
    const githubNewIssueUrl = `https://github.com/TypicalLinguist/collections-extension-issues/issues/new.`;
    return `Error introduced by Typical Linguist plugin '${plugin}'. This is most probable our fault.\n` +
        `\t\t Please Raise an issue on github: ${githubNewIssueUrl} \n` +
        `\t\t Actual:\n\t\t\t${errorMessages.join('\n\t\t\t')}`;
}
