import {SourceFile, Type} from "ts-simple-ast";
import {addImportFromType} from "../../../addImportIfRequired/addImportIfRequired";
import {TypeWrapper} from "./TypeWrapper";
import {TypeTree} from "../../arrayLiteral/TypeTree";

export class BaseTypeWrapper extends TypeWrapper {
    constructor(protected readonly type: Type, protected readonly sourceFile: SourceFile) {
        super(type, sourceFile);
    }

    public getText(): string {
        return addImportFromType(this.type, this.sourceFile);
    }

    public static canBeInstantiatedWith(type: Type): boolean {
        return !type.isArray()
            && !type.isUnion()
            && !type.isIntersection()
            && !type.isTuple()
            && !BaseTypeWrapper.hasTypeArguments(type);
    }

    public getTypeTree(): TypeTree {
        const aliasSymbol = this.type.getAliasSymbol()
        let aliasSymbolName: string;
        if (aliasSymbol) {
            aliasSymbolName = aliasSymbol.getName();
        }
        return new TypeTree(this.type.getText(), null, aliasSymbolName);
    }

    private static hasTypeArguments(type: Type): boolean {
        return type.getTypeArguments().length > 0;
    }
}
