import {SourceFile, Type} from "ts-simple-ast";
import {TypeWrapper} from "./TypeWrapper";
import {TypeTree} from "../../arrayLiteral/TypeTree";

export class TupleTypeWrapper extends TypeWrapper {
    constructor(protected readonly type: Type, protected readonly sourceFile: SourceFile) {
        super(type, sourceFile);
    }

    public getText(): string {
        const tupleArgumentsTypeText = this.type.getTypeArguments().map((childType) => {
            return this.buildTypeText(childType);
        }).join(", ");
        return `[${tupleArgumentsTypeText}]`;
    }

    public static canBeInstantiatedWith(type: Type): boolean {
        return type.isTuple();
    }

    public getTypeTree(): TypeTree {
        const resolvedType = this.type.getTypeArguments().map((childType) => {
            return this.getChildTypeTree(childType);
        });

        const innerAliasedTypeText = resolvedType
            .map((child) => child.aliasedTypeText)
            .join(" , ");

        const aliasedTypeText = `[${innerAliasedTypeText}]`;
        const typeText = this.type.getText();

        return new TypeTree(typeText, resolvedType, aliasedTypeText);
    }
}
