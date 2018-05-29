import {SourceFile} from "ts-simple-ast";

export function collectionsExtensionImport(sourceFile: SourceFile) {
    sourceFile.insertImportDeclaration(0, {
        moduleSpecifier: '@typical-linguist/collections-extension',
        namedImports: ['Array']
    });

    return sourceFile
}