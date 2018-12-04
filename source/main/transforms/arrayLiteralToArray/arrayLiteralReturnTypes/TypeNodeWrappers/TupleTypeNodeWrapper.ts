import {TypeNodeWrapper} from "./TypeNodeWrapper";
import {TupleTypeNode, TypeNode} from "ts-simple-ast";

export class TupleTypeNodeWrapper extends TypeNodeWrapper {
    public static canBeInstantiatedWith(typeNode: TypeNode): boolean {
        return typeNode instanceof TupleTypeNode;
    }
}
