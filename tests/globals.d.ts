declare let expect: ExpectStatic;
declare let sinon: sinon;

declare module "ttypescript/lib/PluginCreator" {
    interface PluginConfig {
        removeDirFunction: (dir: string) => void;
    }
}

declare namespace Chai {
    import {SourceFile} from "ts-simple-ast";

    interface Assertion extends LanguageChains, NumericComparison, TypeComparison {
        copied: Assertion;
        from: Assertion;

        calledInOrderWith(sourceFiles: SourceFile[]): Assertion;

        savedToDirectory(dir: string): Assertion;

        compiledToJavascript(): Assertion;

        filesToEqual(expectedFiles: Map<string, string>): Assertion;

        source(sourceDir: string): Assertion;

        destination(destinationDir: string): Assertion;
    }
}
