import {ArrayLiteralExpression, ArrayTypeNode, CallExpression, Node, SourceFile} from "ts-simple-ast";
import {arrayLiteralToNewArrayExpression} from "./arrayLiteral/arrayLiteralToNewArrayExpression";
import {arrayLiteralReturnTypesToArray} from "./arrayLiteralReturnTypes/arrayLiteralReturnTypesToArray";
import {arrayLiteralTypeToArrayType} from "./arrayLiteralType/arrayLiteralTypeToArrayType";

export function arrayLiteralToArray(sourceFile: SourceFile): SourceFile {
    visit(sourceFile.getChildren(), sourceFile);
    return sourceFile;
}

function visit(nodes: Node[], sourceFile: SourceFile): void {
    nodes.forEach((child) => {
        const children = child.getChildren();

        visit(children, sourceFile);

        if (child instanceof ArrayTypeNode) {
            arrayLiteralTypeToArrayType(child);
        } else if (child instanceof CallExpression) {
            arrayLiteralReturnTypesToArray(child);
        } else if (child instanceof ArrayLiteralExpression) {
            arrayLiteralToNewArrayExpression(child as ArrayLiteralExpression);
        }
    });
}
