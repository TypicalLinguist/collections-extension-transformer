declare let expect: ExpectStatic;
declare let sinon: sinon;

declare namespace NodeJS {
    import ExpectStatic = Chai.ExpectStatic;

    export interface Global {
        sinon: sinon;
        expect: ExpectStatic;
    }

    export interface Process {
        exit: (exitCode?: number) => void;
    }
}

declare namespace Chai {
    import {SourceFile} from "ts-simple-ast";

    interface Assertion extends LanguageChains, NumericComparison, TypeComparison {
        calledInOrderWith(sourceFiles: SourceFile[]): Assertion;

        savedToDirectory(dir: string): Assertion;

        compiledToJavascript(): Assertion;

        throwErrorWithMessage(expectedErrorMessage: string): Assertion;

        filesToEqual(expectedFiles: Map<string, string>): Assertion;
    }
}
