import {ArrayLiteralExpression, SourceFile} from "ts-simple-ast";

export function transformTypescript(sourceFile: SourceFile): SourceFile {
    let variableDeclarations = sourceFile.getVariableDeclarations();

    variableDeclarations.forEach(variableDeclaration => {
        let initializer = variableDeclaration.getInitializerOrThrow();

        if (initializer instanceof ArrayLiteralExpression) {
            const arrayLiteralInitializer = initializer as ArrayLiteralExpression;

            const elements = arrayLiteralInitializer.getElements();

            const typesText = elements.map(element => element.getType().getText());

            const elementsText = elements.map(element => element.getText());

            arrayLiteralInitializer.replaceWithText(codeWriter => {
                codeWriter.write(`new Array<${typesText.join(' | ')}>(${elementsText.join(', ')})`)
            });
        }
    });

    return sourceFile;
}