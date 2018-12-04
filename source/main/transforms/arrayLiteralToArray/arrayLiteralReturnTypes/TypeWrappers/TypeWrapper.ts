import {SourceFile, Type} from "ts-simple-ast";
import {TypeWrapperFactory} from "../TypeWrapperFactory";
import {TypeTree} from "../../arrayLiteral/TypeTree";

export abstract class TypeWrapper {

    protected constructor(protected readonly type: Type, protected readonly sourceFile: SourceFile) {

    }

    public abstract getText(): string;

    public abstract getTypeTree(): TypeTree;

    protected getChildTypeTree(childType: Type): TypeTree | null {
        const typeWrapper = TypeWrapperFactory.createTypeWrapper(childType, this.sourceFile);
        return typeWrapper.getTypeTree();
    }

    protected buildTypeText(type: Type): string {
        return TypeWrapperFactory.createTypeWrapper(type, this.sourceFile).getText();
    }
}

export interface TypeWrapperConstructor {
    new(type: Type, sourceFile: SourceFile): TypeWrapper;

    canBeInstantiatedWith(type: Type): boolean;
}