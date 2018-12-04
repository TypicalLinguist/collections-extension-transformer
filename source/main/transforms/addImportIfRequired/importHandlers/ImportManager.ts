import {SourceFile} from "ts-simple-ast";

export class ImportManager {
    public static getInstanceForSourceFile(sourceFile: SourceFile): ImportManager {
        let importHandler = ImportManager.importHandlers.get(sourceFile.getFilePath());
        if (importHandler) {
            return importHandler;
        } else {
            importHandler = new ImportManager();
            ImportManager.importHandlers.set(sourceFile.getFilePath(), importHandler);
            return importHandler;
        }
    }

    public hasAlreadyBeenAdded(importStatement: string): boolean {
        return this.imports.includes(importStatement);
    }

    public add(importStatement: string): void {
        this.imports.push(importStatement);
    }

    private imports: string[] = [];
    private static importHandlers = new Map<string, ImportManager>();
}
