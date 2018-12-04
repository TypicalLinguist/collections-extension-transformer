import {ExportDeclaration, SourceFile, Symbol, TypeGuards} from "ts-simple-ast";
import {ModuleSpecifierHelper} from "../../../../helpers/ModuleSpecifierHelper";
import {NamedImport} from "./NamedImport";

export class NamedImportWithPathModuleSpecifier extends NamedImport {
    public static canBeInstantiatedWith(symbol: Symbol): boolean {
        return NamedImportWithPathModuleSpecifier.hasNamedExport(symbol)
            || NamedImportWithPathModuleSpecifier.hasNamedFileExport(symbol);
    }

    private static hasNamedExport(symbol: Symbol) {
        const declaration = symbol.getDeclarations()[0];
        return TypeGuards.isExportableNode(declaration) && declaration.isNamedExport();
    }

    private static hasNamedFileExport(symbol: Symbol) {
        const declaration = symbol.getDeclarations()[0];
        return declaration instanceof ExportDeclaration && declaration.hasNamedExports();
    }

    constructor(protected readonly sourceFile: SourceFile, protected readonly symbol: Symbol) {
        super(sourceFile, symbol);
        const declaration = symbol.getDeclarations()[0];
        const declarationSourceFilePath = declaration.getSourceFile().getFilePath();
        const moduleSpecifier = ModuleSpecifierHelper.stripTsExtension(declarationSourceFilePath);
        this.identifierName = this.symbol.getName();
        this.namedImportStructure = {
            moduleSpecifier,
            namedImports: [this.identifierName],
        };
    }
}
