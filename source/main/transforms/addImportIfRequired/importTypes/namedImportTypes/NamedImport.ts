import {Identifier, SourceFile, Symbol} from "ts-simple-ast";
import {Import} from "../Import";

export abstract class NamedImport extends Import {
    protected constructor(protected readonly sourceFile: SourceFile, protected readonly symbol: Symbol) {
        super(sourceFile, symbol);
        this.identifierName = symbol.getName();
    }

    public insert(): void {
        this.sourceFile.insertImportDeclaration(0, this.namedImportStructure);
    }

    protected buildImportStatement(): void {
        this.importStatement = JSON.stringify(this.namedImportStructure);
    }

    protected rename(): void {
        const importName = this.namedImportStructure.namedImports[0];
        this.identifierName = `${importName}_1`;
        this.namedImportStructure.namedImports[0] = `${importName} as ${this.identifierName}`;
    }

    protected getIdentifierName(): string {
        return this.identifierName;
    }

    protected findMatchingIdentifier(rootLevelIdentifiers: Identifier[]): Identifier {
        return rootLevelIdentifiers.find((identifier) => identifier.getText() === this.namedImportStructure.namedImports[0]);
    }

    protected namedImportStructure: ImportStructure;
    protected identifierName: string;
}

interface ImportStructure {
    moduleSpecifier: string;
    namedImports: string[];
}
