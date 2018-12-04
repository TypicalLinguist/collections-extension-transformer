import {CallExpression, SourceFile, Type} from "ts-simple-ast";
import {TypeHelper} from "./TypeHelper";
import {TypeWrapperFactory} from "./TypeWrapperFactory";

let sourceFile: SourceFile;

export function arrayLiteralReturnTypesToArray(callExpression: CallExpression): void {
    sourceFile = callExpression.getSourceFile();
    const returnType = callExpression.getReturnType();

    if (TypeHelper.isNativeArray(returnType)) {
        const arrayType = returnType.getArrayType();
        if (arrayType !== undefined) {
            const asExpression = buildAsExpressionText(callExpression, arrayType);
            callExpression.replaceWithText(asExpression);
        }
    }
}

function buildAsExpressionText(oldCallExpression: CallExpression, arrayType: Type): string {
    const typeArgumentsText = TypeWrapperFactory.createTypeWrapper(arrayType, sourceFile).getText();
    return `(${oldCallExpression.getText()} as Array<${typeArgumentsText}>)`;
}