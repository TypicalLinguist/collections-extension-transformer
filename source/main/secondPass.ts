import Project, {CompilerOptions, SourceFile} from "ts-simple-ast";
import {checkForErrors} from "./common";
import {copyFileSync, existsSync, mkdirSync, readdirSync} from "fs";

export {secondPass, createErrorMessageFromTemplate};

function secondPass(tempDirectory: string, hasInitialErrorMessages: boolean,
                    removeDir: (dir: string) => void, compilerOptions: CompilerOptions): SourceFile[] {

    const compiler = new Project();

    const sourceFiles = compiler.addExistingSourceFiles(`${tempDirectory}/**/*.ts`);

    const moreErrorMessages = checkForErrors(
        compiler.getDiagnostics(),
    );

    const hasCompileErrorMessages = moreErrorMessages.length > 0;

    if (!hasInitialErrorMessages && hasCompileErrorMessages) {
        throw new Error(createErrorMessageFromTemplate(moreErrorMessages));
    }

    const emitResult = compiler.emit();

    if (!existsSync(compilerOptions.outDir)) {
        mkdirSync(compilerOptions.outDir);
    }

    const files = readdirSync(tempDirectory);
    const javascriptFiles = files.filter((file) => file.endsWith(".js"));

    javascriptFiles.forEach((javascriptFile) => {
        copyFileSync(`${tempDirectory}/${javascriptFile}`, `${compilerOptions.outDir}/${javascriptFile}`)
    });

    removeDir(tempDirectory);

    return sourceFiles;
}

function createErrorMessageFromTemplate(errorMessages: string[]): string {
    const plugin = `collection-extension-transformer`;
    const githubNewIssueUrl = `https://github.com/TypicalLinguist/collections-extension-issues/issues/new.`;
    return `Error introduced by Typical Linguist plugin '${plugin}'. This is most probable our fault.\n` +
        `\t\t Please Raise an issue on github: ${githubNewIssueUrl} \n` +
        `\t\t Actual:\n\t\t\t${errorMessages.join("\n\t\t\t")}`;
}
