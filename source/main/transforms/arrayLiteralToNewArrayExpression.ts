import {ArrayLiteralExpression, CodeBlockWriter, Expression, Node, SourceFile} from "ts-simple-ast";

export function arrayLiteralToNewArrayExpression(sourceFile: SourceFile): SourceFile {
    visit(sourceFile.getChildren());

    return sourceFile;
}

function getTypeNames(elements: Expression[]): string[] {
    return elements.map((element) => {
        return element.getType().getBaseTypeOfLiteralType().getText();
    });
}

function getElementsText(elements: Expression[]): string[] {
    return elements.map((element) => element.getText());
}

function writeCode(codeWriter: CodeBlockWriter, elements: Expression[]): void {
    const typesNames = getTypeNames(elements);
    const elementsText = getElementsText(elements);
    const uniqueTypeNames = Array.from(new Set<string>(typesNames));

    codeWriter.write(`new Array<${uniqueTypeNames.join(" | ")}>(${elementsText.join(", ")})`);
}

function replaceWithNewArrayExpression(arrayLiteral: ArrayLiteralExpression): Node {
    return arrayLiteral.replaceWithText((writer) => writeCode(writer, arrayLiteral.getElements()));
}

function visit(nodes: Node[]): void {
    nodes.forEach((child) => {
        const children = child.getChildren();

        visit(children);

        if (child instanceof ArrayLiteralExpression) {
            replaceWithNewArrayExpression(child as ArrayLiteralExpression);
        }
    });
}
