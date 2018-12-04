import {NewExpression, Node} from "ts-simple-ast";
import {NewMapArrayExpressionWrapper} from "./NewMapExpressionWrapper";
import {NewExpressionWrapper} from "./NewExpressionWrapper";

export class NewArrayExpressionWrapper extends NewExpressionWrapper {
    public constructor(protected readonly newExpression: NewExpression) {
        super(newExpression);
        this.replaceArrayTypeArgumentsWithAliasedType();
    }

    private replaceArrayTypeArgumentsWithAliasedType(): void {
        const parent = this.newExpression.getParent() as Node;
        if (!NewMapArrayExpressionWrapper.canBeInstantiatedWith(parent)) {
            this.replaceChildNewExpressionsTypeArgumentsWithAliases();
        }
    }
}
