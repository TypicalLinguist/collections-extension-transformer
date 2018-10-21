import {Identifier, NewExpression, Node, SourceFile} from "ts-simple-ast";

enum CollectionType {
    ARRAY = "Array",
    MAP = "Map",
}

export function collectionsExtensionImport(sourceFile: SourceFile): SourceFile {

    const hasArray = hasNewCollectionExpression(sourceFile, CollectionType.ARRAY);
    const hasMap = hasNewCollectionExpression(sourceFile, CollectionType.MAP);
    const namedImports: string[] = [];

    if (hasArray) {
        namedImports.push(CollectionType.ARRAY);
    }

    if (hasMap) {
        namedImports.push(CollectionType.MAP);
    }

    if (namedImports.length > 0) {
        sourceFile.insertImportDeclaration(0, {
            moduleSpecifier: "@typical-linguist/collections-extension",
            namedImports,
        });
    }

    return sourceFile;
}

function hasNewCollectionExpression(node: Node, collectionType: CollectionType): boolean {
    if (node instanceof NewExpression && node.getExpression() instanceof Identifier) {
        if (node.getExpression().getText() === collectionType) {
            return true;
        }
    }

    let result;

    for (const child of node.getChildren()) {
        result = hasNewCollectionExpression(child, collectionType);

        if (result) {
            break;
        }
    }

    return result;
}
