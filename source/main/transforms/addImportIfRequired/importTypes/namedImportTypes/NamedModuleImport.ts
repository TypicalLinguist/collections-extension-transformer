import {SourceFile, Symbol} from "ts-simple-ast";
import {ScopeHelper} from "../../../../helpers/ScopeHelper";
import {ModuleSpecifierHelper} from "../../../../helpers/ModuleSpecifierHelper";
import {NamedImport} from "./NamedImport";

export class NamedModuleImport extends NamedImport {
    public static canBeInstantiatedWith(symbol: Symbol): boolean {
        return ScopeHelper.hasModuleDeclaration(symbol);
    }

    constructor(protected readonly sourceFile: SourceFile, protected readonly symbol: Symbol) {
        super(sourceFile, symbol);
        const moduleDeclaration = ScopeHelper.getModuleDeclarationWhereSymbolIsDefined(symbol);
        const moduleSpecifier = ModuleSpecifierHelper.stripQuotations(moduleDeclaration.getName());
        this.identifierName = symbol.getName();
        this.namedImportStructure = {
            moduleSpecifier,
            namedImports: [this.identifierName],
        };
    }
}
