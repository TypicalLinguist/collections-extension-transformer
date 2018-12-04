import {Identifier, ImportDeclaration, ImportSpecifier, SourceFile, Symbol, SyntaxList} from "ts-simple-ast";
import {ImportManager} from "../importHandlers/ImportManager";
import flatten = require("lodash.flatten");

export abstract class Import {
    protected manager: ImportManager;

    protected constructor(protected readonly sourceFile: SourceFile, protected readonly symbol: Symbol) {
        this.manager = ImportManager.getInstanceForSourceFile(sourceFile);
    }

    public insertIntoFileSafely(): string {
        this.handleConflicts();
        this.buildImportStatement();
        if (!this.manager.hasAlreadyBeenAdded(this.importStatement)) {
            this.insert();
            this.manager.add(this.importStatement);
        }
        return this.getIdentifierName();
    }

    protected conflictsWithExistingDeclaration(): boolean {
        const importDeclarations = this.sourceFile.getImportDeclarations() as ImportDeclaration[];
        const importIdentifiers = this.getImportIdentifiers(importDeclarations);
        const rootSyntaxList = this.findRootSyntaxList();
        const rootLevelIdentifiers = this.findRootLevelIdentifiers(rootSyntaxList);
        const identifiers = rootLevelIdentifiers.concat(importIdentifiers);
        importIdentifiers.forEach((identifier) => {
            if (identifier.getText() === "default") {
                // console.log(identifier.getParent().getChildren().map((child) => child.getKindName()));
                // const namedImports = identifier.getParent().getChildren()[2] as NamedImports;
                // console.log(namedImports.getElements().map(e => e.getText()));
                // const parent1 = identifier.getParent().getParent() as ImportDeclaration;
                // console.log(parent1.getNamedImports().map(i => i.getName()))
                const parent1 = identifier.getParent() as ImportSpecifier;
                console.log(parent1.getAliasNode().getText());
            }
        })
        const matchingIdentifier = this.findMatchingIdentifier(identifiers);
        return matchingIdentifier !== undefined;
    }

    protected abstract insert(): void;

    protected abstract buildImportStatement(): void;

    protected abstract rename(): void;

    protected abstract getIdentifierName(): string;

    protected abstract findMatchingIdentifier(rootLevelIdentifiers: Identifier[]): Identifier | undefined;

    private handleConflicts(): void {
        if (this.conflictsWithExistingDeclaration()) {
            this.rename();
        }
    }

    private getImportIdentifiers(importDeclarations: ImportDeclaration[]): Identifier[] {
        return flatten(importDeclarations.map((importDeclaration) => {
                if (importDeclaration.getDefaultImport()) {
                    if (importDeclaration.getNamedImports()) {
                        return flatten([
                            importDeclaration.getDefaultImport(),
                            importDeclaration.getNamedImports().map((identifier) => {
                                let namedNode = identifier.getNameNode();
                                if (namedNode.getText() === "default") {
                                    namedNode = identifier.getAliasNode();
                                }
                                return namedNode;
                            }),
                        ]);
                    }
                    return importDeclaration.getDefaultImport();
                } else if (importDeclaration.getNamespaceImport()) {
                    return importDeclaration.getNamespaceImport();
                } else if (importDeclaration.getNamedImports()) {
                    return importDeclaration.getNamedImports()
                        .map((importIdentifier) => importIdentifier.getNameNode());
                } else {
                    return undefined;
                }
            },
        ).filter((identifier) => identifier !== undefined));
    }

    private findRootSyntaxList(): SyntaxList | undefined {
        return this.sourceFile.getChildren().find((child) => child instanceof SyntaxList) as SyntaxList | undefined;
    }

    private findRootLevelIdentifiers(rootSyntaxList: SyntaxList): Identifier[] {
        return rootSyntaxList.getChildren().map((rootSyntaxChild) => {
            return rootSyntaxChild.getChildren().find((child) => child instanceof Identifier) as Identifier | undefined;
        }).filter((child) => child !== undefined);
    }

    protected importStatement: string;
}

export interface ImportConstructor {
    new(sourceFile: SourceFile, symbol: Symbol): Import;

    canBeInstantiatedWith(symbol: Symbol): boolean;
}
