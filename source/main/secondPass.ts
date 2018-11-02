import Project, {CompilerOptions, SourceFile} from "ts-simple-ast";
import {copyFileSync, existsSync, mkdirSync} from "fs";
import {dirname} from "path";
import {checkForErrors} from "./common";
import mkdirp = require("mkdirp");
import recursiveReadDirSync = require("recursive-readdir-sync");

export {secondPass, createErrorMessageFromTemplate};

function secondPass(tempDirectory: string,
                    removeDir: (dir: string) => void,
                    compilerOptions: CompilerOptions): SourceFile[] {

    const compiler = configureCompiler(compilerOptions);
    const sourceFiles = compiler.addExistingSourceFiles(tempDirectory);
    const preEmitDiagnostics = compiler.getPreEmitDiagnostics();

    if (checkForErrors(preEmitDiagnostics)) {
        const formattedDiagnosticsMessages = compiler.formatDiagnosticsWithColorAndContext(preEmitDiagnostics);
        throw new Error(createErrorMessageFromTemplate(formattedDiagnosticsMessages));
    }

    const emitResult = compiler.emit();

    moveOutputToOutDir(tempDirectory, compilerOptions.outDir);

    removeDir(tempDirectory);

    return sourceFiles;
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
    const projectCompilerOptions = JSON.parse(JSON.stringify(compilerOptions));
    delete projectCompilerOptions.outDir;

    const compiler = new Project({
        addFilesFromTsConfig: false,
        compilerOptions: projectCompilerOptions,
    });
    return compiler;
}

function moveOutputToOutDir(tempDirectory: string, outDir: string): void {
    if (!existsSync(outDir)) {
        mkdirSync(outDir);
    }

    const files = recursiveReadDirSync(tempDirectory);
    const javascriptFiles = files.filter((file) => {
        return file.endsWith(".js");
    });

    javascriptFiles.forEach((javascriptFile) => {
        const relativePath = javascriptFile.split(`${tempDirectory}/`)[1];
        const dest = `${outDir}/${relativePath}`;
        mkdirp.sync(dirname(dest));
        copyFileSync(`${javascriptFile}`, dest);
    });
}
