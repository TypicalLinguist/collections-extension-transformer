import {TypeNode} from "ts-simple-ast";
import {CollectionTypeNodeWrapperConstructor, TypeNodeWrapper} from "./TypeNodeWrapper";
import {ArrayTypeNodeWrapper} from "./ArrayTypeNodeWrapper";
import {TupleTypeNodeWrapper} from "./TupleTypeNodeWrapper";

export class CollectionTypeNodeWrapperFactory {
    public static createTypeNodeWrapper(typeNode: TypeNode): TypeNodeWrapper {
        const MatchingConstructor = this.Constructors
            .find((Constructor) => Constructor.canBeInstantiatedWith(typeNode));

        if (MatchingConstructor) {
            return new MatchingConstructor(typeNode);
        } else {
            return undefined;
        }
    }

    private static Constructors: CollectionTypeNodeWrapperConstructor[] = [
        ArrayTypeNodeWrapper,
        TupleTypeNodeWrapper,
    ];
}
