import {SourceFile} from "ts-simple-ast";

export class NodeHelper {
    public static getFilePathWithoutExtensions(sourceFile: SourceFile): string {
        return sourceFile.getFilePath()
            .replace(".d.ts", "")
            .replace(".ts", "");
    }
}