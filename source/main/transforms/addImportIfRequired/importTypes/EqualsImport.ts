import {ExportAssignment, Identifier, SourceFile, Symbol, SyntaxKind} from "ts-simple-ast";
import {NodeHelper} from "../../../helpers/NodeHelper";
import {Import} from "./Import";

export class EqualsImport extends Import {
    public static canBeInstantiatedWith(symbol: Symbol): boolean {
        const declaration = symbol.getDeclarations()[0];
        const syntaxList = declaration.getParent().getChildrenOfKind(SyntaxKind.SyntaxList)[0];
        const exportAssignments = syntaxList.getChildrenOfKind(SyntaxKind.ExportAssignment) as ExportAssignment[];
        const matchingExportAssignment = this.findMatchingExportAssignment(exportAssignments, symbol);
        return matchingExportAssignment !== undefined;
    }

    private static findMatchingExportAssignment(exportAssignments: ExportAssignment[], symbol: Symbol): ExportAssignment {
        return exportAssignments.find((exportAssignment) => {
            const identifier = exportAssignment.getChildren().find((child) => child instanceof Identifier);
            return identifier.getText() === symbol.getName();
        });
    }

    constructor(protected readonly sourceFile: SourceFile, protected readonly symbol: Symbol) {
        super(sourceFile, symbol);
        const declarationSourceFile = symbol.getDeclarations()[0].getSourceFile();
        this.moduleSpecifier = NodeHelper.getFilePathWithoutExtensions(declarationSourceFile);
        this.importName = symbol.getName();
    }

    protected insert(): void {
        this.sourceFile.insertStatements(0, this.importStatement);
    }

    protected buildImportStatement(): void {
        this.importStatement = `import ${this.importName} = require("${this.moduleSpecifier}")`;
    }

    protected rename(): void {
        this.importName = `${this.importName}_1`;
    }

    protected getIdentifierName(): string {
        return this.importName;
    }

    protected findMatchingIdentifier(rootLevelIdentifiers: Identifier[]): Identifier {
        return rootLevelIdentifiers.find((identifier) => identifier.getText() === this.importName);
    }

    private readonly moduleSpecifier: string;
    private importName: string;
    protected importStatement: string;
}
