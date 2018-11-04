import {ArrayLiteralExpression, NewExpression, Node, Type} from "ts-simple-ast";
import {createNewArrayExpression, isNewMapExpression,} from "./createNewArrayExpression";

import {findAliasInResolvedTypeTree} from "./findAliasInResolvedTypeTree";
import {ResolvedTypeTree} from "./resolvedTypeTree";

export function arrayLiteralToNewArrayExpression(arrayLiteral: ArrayLiteralExpression): Node {
    const newArrayExpression = createNewArrayExpression(arrayLiteral);

    const parent = newArrayExpression.getParent();
    
    if (!isNewMapExpression(parent)) {
        const resolvedTypeTree = ResolvedTypeTree.buildResolvedTypeTree(newArrayExpression.getType());
        recursivelyReplaceArgumentTypesWithAliases(newArrayExpression, resolvedTypeTree);
    }

    return newArrayExpression;
}

function recursivelyReplaceArgumentTypesWithAliases(expression: NewExpression,
                                                    resolvedTypeTree: ResolvedTypeTree): void {

    const newExpressionArguments = expression.getArguments().filter((arg) => arg instanceof NewExpression);

    newExpressionArguments.forEach((arg: NewExpression) => {
        recursivelyReplaceArgumentTypesWithAliases(arg, resolvedTypeTree);
        replaceArgumentTypesWithAliases(arg, resolvedTypeTree);
    });
}

function replaceArgumentTypesWithAliases(arg: NewExpression, resolvedTypeTree: ResolvedTypeTree): void {
    const typeArgs = arg.getType().getTypeArguments();

    typeArgs.forEach((typeArg: Type, index) => {
        const matchingType = findAliasInResolvedTypeTree(resolvedTypeTree,
            typeArg);

        if (matchingType) {
            arg.removeTypeArgument(index);
            arg.insertTypeArgument(index, matchingType);
        }
    });
}