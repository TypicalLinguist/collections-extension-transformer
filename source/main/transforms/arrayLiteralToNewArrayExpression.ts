import {ArrayLiteralExpression, CodeBlockWriter, Expression, SourceFile} from "ts-simple-ast";

export function arrayLiteralToNewArrayExpression(sourceFile: SourceFile) {
    let variableDeclarations = sourceFile.getVariableDeclarations();

    variableDeclarations.forEach(variableDeclaration => {
        let initializer = variableDeclaration.getInitializer();

        if (initializer instanceof ArrayLiteralExpression) {
            replaceWithNewArrayExpression(initializer as ArrayLiteralExpression);
        }
    });

    return sourceFile
}

function getTypeNames(elements: Expression[]): string[] {
    return elements.map(element => element.getType().getText());
}

function getElementsText(elements: Expression[]): string[] {
    return elements.map(element => element.getText());
}

function writeCode(codeWriter: CodeBlockWriter, elements: Expression[]) {
    const typesNames = getTypeNames(elements);
    const elementsText = getElementsText(elements);
    codeWriter.write(`new Array<${typesNames.join(' | ')}>(${elementsText.join(', ')})`)
}

function replaceWithNewArrayExpression(arrayLiteral: ArrayLiteralExpression) {
    arrayLiteral.replaceWithText(writer => writeCode(writer, arrayLiteral.getElements()));
}