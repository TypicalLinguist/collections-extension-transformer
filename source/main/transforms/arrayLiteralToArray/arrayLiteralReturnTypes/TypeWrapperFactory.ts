import {TypeWrapper, TypeWrapperConstructor} from "./TypeWrappers/TypeWrapper";
import {SourceFile, Type} from "ts-simple-ast";
import {ArrayTypeWrapper} from "./TypeWrappers/ArrayTypeWrapper";
import {UnionTypeWrapper} from "./TypeWrappers/UnionTypeWrapper";
import {IntersectionTypeWrapper} from "./TypeWrappers/IntersectionTypeWrapper";
import {TupleTypeWrapper} from "./TypeWrappers/TupleTypeWrapper";
import {TypeWithArgumentsWrapper} from "./TypeWrappers/TypeWithArgumentsWrapper";
import {BaseTypeWrapper} from "./TypeWrappers/BaseTypeWrapper";

export class TypeWrapperFactory {
    public static createTypeWrapper(type: Type, sourceFile: SourceFile): TypeWrapper | undefined {
        const MatchingConstructor = this.Constructors.find((Constructor) => Constructor.canBeInstantiatedWith(type));

        if (MatchingConstructor) {
            return new MatchingConstructor(type, sourceFile);
        } else {
            return undefined;
        }
    }

    private static Constructors: TypeWrapperConstructor[] = [
        ArrayTypeWrapper,
        UnionTypeWrapper,
        IntersectionTypeWrapper,
        TupleTypeWrapper,
        TypeWithArgumentsWrapper,
        BaseTypeWrapper,
    ];
}
