import {SourceFile, Type} from "ts-simple-ast";
import {TypeWrapper} from "./TypeWrapper";
import {TypeTree} from "../../arrayLiteral/TypeTree";

export class UnionTypeWrapper extends TypeWrapper {
    constructor(protected readonly type: Type, protected readonly sourceFile: SourceFile) {
        super(type, sourceFile);
    }

    public getText(): string {
        return this.type.getUnionTypes().map((childType) => {
            return this.buildTypeText(childType);
        }).join(" | ");
    }

    public getTypeTree(): TypeTree {
        const childTrees = this.type.getUnionTypes().map((childType) => {
            return this.getChildTypeTree(childType);
        });

        const aliasedTypeText = childTrees
            .map((child) => child.aliasedTypeText)
            .join(" | ");

        const typeText = this.type.getText();
        return new TypeTree(typeText, childTrees, aliasedTypeText);
    }

    public static canBeInstantiatedWith(type: Type): boolean {
        return type.isUnion();
    }
}