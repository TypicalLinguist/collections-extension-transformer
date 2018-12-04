import {Type} from "ts-simple-ast";
import {BaseTypeWrapper} from "../arrayLiteralReturnTypes/TypeWrappers/BaseTypeWrapper";

export class TypeTree {
    public constructor(public typeText: string,
                       public childTrees: TypeTree[],
                       public aliasedTypeText: string) {
    }

    public findAliasFor(type: Type): string | undefined {
        if (!BaseTypeWrapper.canBeInstantiatedWith(type)) {
            const types = type.isUnion() ? type.getUnionTypes() : type.getTypeArguments();
            if (this.typesMatch(types)) {
                return this.typeText;
            } else {
                return this.searchChildTreesForAlias(type);
            }
        } else {
            return undefined;
        }
    }

    public searchChildTreesForAlias(type: Type): string | undefined {
        const potentialAliases = this.childTrees.map((childTree) => {
            return childTree.findAliasFor(type);
        });

        return potentialAliases.find((alias) => alias !== undefined);
    }

    private typesMatch(types: Type[]): boolean {
        return types.find((type) => {
            return this.childTrees.find((typeTree) => {
                return type.getText() === typeTree.aliasedTypeText;
            }) !== undefined;
        }) !== undefined;
    }
}