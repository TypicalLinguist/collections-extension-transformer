import {ArrayTypeNode, ParenthesizedTypeNode} from "ts-simple-ast";

export function buildArrayTypeNodeTypeText(arrayTypeNode: ArrayTypeNode): string {
    const elementTypeNode = arrayTypeNode.getElementTypeNode();

    let typeArgumentsText: string;

    if (elementTypeNode instanceof ParenthesizedTypeNode) {
        typeArgumentsText = elementTypeNode.getTypeNode().getText();
    } else {
        typeArgumentsText = elementTypeNode.getText();
    }

    return `Array<${typeArgumentsText}>`;
}
