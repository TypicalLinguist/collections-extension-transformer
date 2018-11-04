import {CallExpression} from "ts-simple-ast";

export function arrayLiteralReturnTypesToArray(callExpression: CallExpression): void {
    const returnType = callExpression.getReturnType();
    if (returnType.isArray() && !returnType.getText().includes("@typical-linguist")) {
        const oldCallExpression = callExpression.getFullText();
        const arrayType = returnType.getArrayType().getText();
        callExpression.replaceWithText(`(${oldCallExpression} as Array<${arrayType}>)`);
    }
}