import {SourceFile} from "ts-simple-ast";

export function addImportForNativeCollectionExtension(sourceFile: SourceFile) {
    sourceFile.insertImportDeclaration(0, {
        moduleSpecifier: 'native-collection-extension',
        namedImports: ['Array']
    });

    return sourceFile
}