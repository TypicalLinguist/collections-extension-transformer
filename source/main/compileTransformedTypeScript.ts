import Project, {CompilerOptions, SourceFile} from "ts-simple-ast";
import {checkForErrors} from "./common";

export {compileTransformedTypeScript, createErrorMessageFromTemplate};

function compileTransformedTypeScript(tempDirectory: string,
                                      removeDir: (dir: string) => void,
                                      compilerOptions: CompilerOptions): SourceFile[] {

    const compiler = configureCompiler(compilerOptions);
    const sourceFiles = compiler.addExistingSourceFiles(tempDirectory);
    ifSyntacticalErrorsThrow(compiler, tempDirectory, removeDir);
    emitJavascript(compiler, tempDirectory, compilerOptions, removeDir);

    return sourceFiles;
}

function ifSyntacticalErrorsThrow(compiler: Project, tempDirectory: string, removeDir: (dir: string) => void): void {
    const preEmitDiagnostics = compiler.getPreEmitDiagnostics();

    if (checkForErrors(preEmitDiagnostics)) {
        const formattedDiagnosticsMessages = compiler.formatDiagnosticsWithColorAndContext(preEmitDiagnostics);
        throw new Error(createErrorMessageFromTemplate(formattedDiagnosticsMessages));
    }
}

function emitJavascript(compiler: Project,
                        tempDirectory: string,
                        compilerOptions: CompilerOptions,
                        removeDir: (dir: string) => void): void {

    compiler.emit();
    // moveOutputToOutDir(tempDirectory, compilerOptions.outDir);
    // removeDir(tempDirectory);
}

function createErrorMessageFromTemplate(errorMessages: string): string {
    const plugin = `collection-extension-transformer`;
    const githubNewIssueUrl = `https://github.com/TypicalLinguist/collections-extension-issues/issues/new.`;
    return `Error introduced by Typical Linguist plugin '${plugin}'. This is most probable our fault.\n` +
        `\t\t Please Raise an issue on github: ${githubNewIssueUrl} \n` +
        "\t\t and include the relevant files/snippets in the error(s) below in the issue from the " +
        "generated ./.typical-linguist temporary directory \n" +
        `Actual:\n${errorMessages}`;
}

function configureCompiler(compilerOptions: CompilerOptions): Project {
    const compiler = new Project({
        addFilesFromTsConfig: false,
        compilerOptions,
    });
    return compiler;
}

function moveOutputToOutDir(tempDirectory: string, outDir: string): void {
    // if (!existsSync(outDir)) {
    //     mkdirSync(outDir);
    // }
    //
    // const files = recursiveReadDirSync(tempDirectory);
    // const producedFiles = files.filter((file) => {
    //     return file.endsWith(".js") || file.endsWith(".map.js") || file.endsWith("d.ts");
    // });
    //
    // files.forEach((producedFile) => {
    //     const relativePath = producedFile.split(`${tempDirectory}/`)[1];
    //     const dest = `${outDir}/.typicalLinguist/${relativePath}`;
    //     mkdirp.sync(dirname(dest));
    //     copyFileSync(`${producedFile}`, dest);
    // });
}
