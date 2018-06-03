import {Identifier, NewExpression, Node, SourceFile} from "ts-simple-ast";

export function collectionsExtensionImport(sourceFile: SourceFile): SourceFile {
    if (hasNewArrayExpression(sourceFile)) {
        sourceFile.insertImportDeclaration(0, {
            moduleSpecifier: "@typical-linguist/collections-extension",
            namedImports: ["Array"],
        });
    }

    return sourceFile;
}

function hasNewArrayExpression(node: Node): boolean {
    if (node instanceof NewExpression && node.getExpression() instanceof Identifier) {
        return node.getExpression().getText() === "Array";
    } else {
        let result = false;

        for (const child of node.getChildren()) {
            result = result || hasNewArrayExpression(child);

            if (result) {
                break;
            }
        }

        return result;
    }
}
