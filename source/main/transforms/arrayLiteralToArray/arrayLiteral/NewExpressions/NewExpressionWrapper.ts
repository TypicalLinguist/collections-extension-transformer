import {NewExpression, Node, Type} from "ts-simple-ast";
import {TypeTree} from "../TypeTree";
import {TypeWrapperFactory} from "../../arrayLiteralReturnTypes/TypeWrapperFactory";

export class NewExpressionWrapper {
    public static canBeInstantiatedWith(node: Node): boolean {
        return node instanceof NewExpression;
    }

    public constructor(protected readonly newExpression: NewExpression) {

    }

    protected getTypeTree(): TypeTree {
        const typeWrapper = TypeWrapperFactory.createTypeWrapper(this.newExpression.getType(),
            this.newExpression.getSourceFile());

        return typeWrapper.getTypeTree();
    }

    protected getNewExpressionArguments(): NewExpressionWrapper[] {
        const result: NewExpressionWrapper[] = [];
        const newExpressionArguments = this.newExpression.getArguments();
        if (newExpressionArguments.length > 0) {
            newExpressionArguments.forEach((argument) => {
                if (NewExpressionWrapper.canBeInstantiatedWith(argument)) {
                    result.push(new NewExpressionWrapper(argument as NewExpression));
                }
            });
        }

        return result;
    }

    protected replaceChildNewExpressionsTypeArgumentsWithAliases(): void {
        this.getNewExpressionArguments().forEach((childNewExpression: NewExpressionWrapper) => {
            childNewExpression.replaceChildNewExpressionsTypeArgumentsWithAliases();
            childNewExpression.replaceArgumentTypesWithAliases(this.getTypeTree());
        });
    }

    protected replaceArgumentTypesWithAliases(parentTypeTree: TypeTree): void {
        const typeArgs = this.newExpression.getType().getTypeArguments();

        typeArgs.forEach((typeArg: Type, index) => {
            const matchingType = parentTypeTree.findAliasFor(typeArg);

            if (matchingType) {
                this.newExpression.removeTypeArgument(index);
                this.newExpression.insertTypeArgument(index, matchingType);
            }
        });
    }
}

interface NewExpressionWrapperConstructor {
    new(newExpression: NewExpressionWrapper): NewExpressionWrapper;
}