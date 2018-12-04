import {Identifier, SourceFile, Symbol, SyntaxKind} from "ts-simple-ast";
import {ScopeHelper} from "../../../helpers/ScopeHelper";
import {Import} from "./Import";

export class TypeFromNamespaceImport extends Import {
    public static canBeInstantiatedWith(symbol: Symbol): boolean {
        return ScopeHelper.hasNamespaceDeclaration(symbol);
    }

    constructor(protected readonly sourceFile: SourceFile, protected readonly symbol: Symbol) {
        super(sourceFile, symbol);
        this.namespaceSpecifier = ScopeHelper.getNamespaceDeclarationWhereSymbolIsDefined(symbol)
            .getChildrenOfKind(SyntaxKind.Identifier)[0]
            .getText();

        this.importName = symbol.getName();
    }

    protected insert(): void {
        this.sourceFile.insertStatements(0, this.importStatement);
    }

    protected buildImportStatement(): void {
        this.importStatement = `import ${this.importName} = ${this.namespaceSpecifier}.${this.symbol.getName()};`;
    }

    protected rename(): void {
        this.importName = `${this.importName}_1`;
    }

    protected getIdentifierName(): string {
        return this.importName;
    }

    protected findMatchingIdentifier(rootLevelIdentifiers: Identifier[]): Identifier | undefined {
        return rootLevelIdentifiers.find((identifier) => identifier.getText() === this.importName);
    }

    private readonly namespaceSpecifier: string;
    private importName: string;
}
