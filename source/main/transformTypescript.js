"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_simple_ast_1 = require("ts-simple-ast");
function transformTypescript(sourceFile) {
    let variableDeclarations = sourceFile.getVariableDeclarations();
    variableDeclarations.forEach(variableDeclaration => {
        let initializer = variableDeclaration.getInitializerOrThrow();
        if (initializer instanceof ts_simple_ast_1.ArrayLiteralExpression) {
            const arrayLiteralInitializer = initializer;
            const elements = arrayLiteralInitializer.getElements();
            const typesText = elements.map(element => element.getType().getText());
            const elementsText = elements.map(element => element.getText());
            arrayLiteralInitializer.replaceWithText(codeWriter => {
                codeWriter.write(`new Array<${typesText.join(' | ')}>(${elementsText.join(', ')})`);
            });
        }
    });
    return sourceFile;
}
exports.transformTypescript = transformTypescript;
//# sourceMappingURL=transformTypescript.js.map