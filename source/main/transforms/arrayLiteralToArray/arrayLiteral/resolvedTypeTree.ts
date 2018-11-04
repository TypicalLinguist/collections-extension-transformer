import {Type} from "ts-simple-ast";
import {removeFullyQualifiedPartsFromType} from "./createNewArrayExpression";

export class ResolvedTypeTree {
    public static buildResolvedTypeTree(type: Type): ResolvedTypeTree {
        if (type.isArray()) {
            return ResolvedTypeTree.buildTypeTreeFromArrayType(type);
        } else if (type.isUnion()) {
            return ResolvedTypeTree.buildTypeTreeFromUnionType(type);
        } else {
            return {
                originalTypeText: removeFullyQualifiedPartsFromType(type.getText()),
                text: removeFullyQualifiedPartsFromType(type.getText()),
                type,
            };
        }
    }

    private static buildTypeTreeFromUnionType(type: Type): ResolvedTypeTree {
        const resolvedType = type.getUnionTypes().map((childType) => {
            return ResolvedTypeTree.buildResolvedTypeTree(childType);
        });

        const text = resolvedType.map((child) => child.text).join(" | ");

        return {
            originalTypeText: removeFullyQualifiedPartsFromType(type.getText()),
            text: removeFullyQualifiedPartsFromType(text),
            type: resolvedType,
        };
    }

    private static buildTypeTreeFromArrayType(type: Type): ResolvedTypeTree {
        const resolvedType = type.getTypeArguments().map((typeArgument) => {
            return ResolvedTypeTree.buildResolvedTypeTree(typeArgument);
        });

        const text = `(${resolvedType.map((child) => child.text).join(" | ")})[]`;

        return {
            originalTypeText: removeFullyQualifiedPartsFromType(type.getText()),
            text: removeFullyQualifiedPartsFromType(text),
            type: resolvedType,
        };
    }

    constructor(public originalTypeText: string,
                public type: Type | ResolvedTypeTree | ResolvedTypeTree[],
                public text: string) {
    }
}
