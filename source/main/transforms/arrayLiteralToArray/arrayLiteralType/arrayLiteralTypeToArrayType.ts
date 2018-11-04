import {ArrayTypeNode, ParenthesizedTypeNode} from "ts-simple-ast";

export function arrayLiteralTypeToArrayType(arrayTypeNode: ArrayTypeNode): void {
    arrayTypeNode.replaceWithText(buildTypeText(arrayTypeNode));
}

function buildTypeText(arrayTypeNode: ArrayTypeNode): string {
    const elementTypeNode = arrayTypeNode.getElementTypeNode();

    let text: string;

    if (elementTypeNode instanceof ParenthesizedTypeNode) {
        text = elementTypeNode.getTypeNode().getText();
    } else {
        text = elementTypeNode.getText();
    }

    return `Array<${text}>`;
}
