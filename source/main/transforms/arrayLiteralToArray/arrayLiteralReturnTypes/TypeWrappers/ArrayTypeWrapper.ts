import {TypeWrapper} from "./TypeWrapper";
import {SourceFile, Type} from "ts-simple-ast";
import {TypeTree} from "../../arrayLiteral/TypeTree";

export class ArrayTypeWrapper extends TypeWrapper {
    constructor(protected readonly type: Type, protected readonly sourceFile: SourceFile) {
        super(type, sourceFile);
    }

    public getText(): string {
        const arrayTypeArgument = this.type.getArrayType() as Type;
        const typeText = this.buildTypeText(arrayTypeArgument);
        return `Array<${typeText}>`;
    }

    public getTypeTree(): TypeTree {
        const arrayTypeArgument = this.type.getArrayType() as Type;
        const childTypeTree = this.getChildTypeTree(arrayTypeArgument);

        const aliasedTypeText = `(${childTypeTree.aliasedTypeText})[]`;
        const typeText = this.type.getText();
        return new TypeTree(typeText, [childTypeTree], aliasedTypeText);
    }

    public static canBeInstantiatedWith(type: Type): boolean {
        return type.isArray();
    }

}