import {ArrayLiteralExpression} from "ts-simple-ast";
import {ArrayLiteralExpressionWrapper} from "./ArrayLiteralExpressionWrapper";

export function arrayLiteralToNewArrayExpression(arrayLiteral: ArrayLiteralExpression): void {
    const arrayLiteralExpression = new ArrayLiteralExpressionWrapper(arrayLiteral);

    arrayLiteralExpression.toNewArrayExpression();
}
