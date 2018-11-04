import {Type} from "ts-simple-ast";
import {ResolvedTypeTree} from "./resolvedTypeTree";

export function findAliasInResolvedTypeTree(resolvedTypeTree: ResolvedTypeTree, type: Type): string | undefined {
    if (resolvedTypeTree.type instanceof Array) {
        const typeArray = type.isUnion() ? type.getUnionTypes() : type.getTypeArguments();
        if (arraysMatch(resolvedTypeTree.type, typeArray)) {
            return resolvedTypeTree.originalTypeText;
        } else {
            return findMatchInMultipleTrees(resolvedTypeTree.type, type);
        }
    } else {
        return undefined;
    }
}

function findMatchInMultipleTrees(trees: ResolvedTypeTree[], type: Type): string | undefined {
    return trees.map((childTree) => {
        return findAliasInResolvedTypeTree(childTree, type);
    }).reduce((previousValue, currentValue) => {
        if (previousValue) {
            return previousValue;
        } else {
            return currentValue;
        }
    });
}

function findMatches(types: Type[], resolvedTypes: ResolvedTypeTree[]): boolean {
    return !types.map((type) => {
        let result: boolean = false;

        resolvedTypes.forEach((resolvedType) => {
            if (type.getText() === resolvedType.text) {
                result = true;
            }
        });

        return result;
    }).includes(false);
}

function arraysMatch(resolvedTypes: ResolvedTypeTree[], types: Type[]): boolean {
    if (types.length > 0) {
        return findMatches(types, resolvedTypes);
    } else {
        return false;
    }
}
