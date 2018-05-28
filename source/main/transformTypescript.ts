import {ArrayLiteralExpression, SourceFile} from "ts-simple-ast";

export {transformArrayLiteralToNewArrayExpression, addImportForNativeCollectionExtension}

function transformArrayLiteralToNewArrayExpression(sourceFile: SourceFile) {
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

    return sourceFile
}

function addImportForNativeCollectionExtension(sourceFile: SourceFile) {
    sourceFile.insertImportDeclaration(0, {
        moduleSpecifier: 'native-collection-extension',
        namedImports: ['Array']
    });
    
    return sourceFile
}