import {ImportTypeNode, SourceFile, Symbol} from "ts-simple-ast";
import {EqualsImport} from "./importTypes/EqualsImport";
import {Import, ImportConstructor} from "./importTypes/Import";
import {NamedImportFromInlineImport} from "./importTypes/namedImportTypes/NamedImportFromInlineImport";
import {NamedImportWithPathModuleSpecifier} from "./importTypes/namedImportTypes/NamedImportWithPathModuleSpecifier";
import {NamedModuleImport} from "./importTypes/namedImportTypes/NamedModuleImport";
import {TypeFromNamespaceImport} from "./importTypes/TypeFromNamespaceImport";

export class ImportFactory {
    public static createImportFromInlineImport(typeNode: ImportTypeNode): NamedImportFromInlineImport {
        return new NamedImportFromInlineImport(typeNode);
    }

    public static createImport(sourceFile: SourceFile, symbol: Symbol): Import | undefined {
        return instantiate(NamedModuleImport, sourceFile, symbol) ||
            instantiate(TypeFromNamespaceImport, sourceFile, symbol) ||
            instantiate(NamedImportWithPathModuleSpecifier, sourceFile, symbol) ||
            instantiate(EqualsImport, sourceFile, symbol);
    }
}

function instantiate(Class: ImportConstructor, sourceFile: SourceFile, symbol: Symbol): Import | undefined {
    if (Class.canBeInstantiatedWith(symbol)) {
        return new Class(sourceFile, symbol);
    }

    return undefined;
}