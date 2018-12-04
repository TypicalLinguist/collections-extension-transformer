import {ParameterDeclaration, SyntaxKind, TypeNode} from "ts-simple-ast";

export abstract class TypeNodeWrapper {
    public constructor(protected readonly typeNode: TypeNode) {

    }

    public getParentParameter(): ParameterDeclaration | undefined {
        return this.typeNode.getParentIfKind(SyntaxKind.Parameter) as ParameterDeclaration;
    }
}

export interface CollectionTypeNodeWrapperConstructor {
    new(typeNode: TypeNode): TypeNodeWrapper;

    canBeInstantiatedWith(typeNode: TypeNode): boolean;
}