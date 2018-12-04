import {TypeNodeWrapper} from "./TypeNodeWrapper";
import {ArrayTypeNode, TypeNode} from "ts-simple-ast";

export class ArrayTypeNodeWrapper extends TypeNodeWrapper {
    public static canBeInstantiatedWith(typeNode: TypeNode): boolean {
        return typeNode instanceof ArrayTypeNode;
    }
}
