import {SourceFile} from "ts-simple-ast";

enum CollectionType {
    ARRAY = "Array",
    MAP = "Map",
}

export function collectionsExtensionImport(sourceFile: SourceFile): SourceFile {

    if (!sourceFile.isDeclarationFile()) {
        sourceFile.insertImportDeclaration(0, {
            moduleSpecifier: "@typical-linguist/collections-extension",
            namedImports: [CollectionType.ARRAY, CollectionType.MAP],
        });
    }

    return sourceFile;
}