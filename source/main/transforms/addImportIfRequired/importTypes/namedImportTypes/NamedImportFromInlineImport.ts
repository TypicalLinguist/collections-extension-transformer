import {ImportTypeNode, Symbol} from "ts-simple-ast";
import {ModuleSpecifierHelper} from "../../../../helpers/ModuleSpecifierHelper";
import {NamedImport} from "./NamedImport";

export class NamedImportFromInlineImport extends NamedImport {
    public static canBeInstantiatedWith(symbol: Symbol): boolean {
        throw new Error("Unimplemented");
    }

    constructor(protected readonly importTypeNode: ImportTypeNode) {
        super(importTypeNode.getSourceFile(), importTypeNode.getType().getSymbol());
        const moduleSpecifier = ModuleSpecifierHelper.stripQuotations(importTypeNode.getArgument().getText());
        this.identifierName = importTypeNode.getQualifier().getText();
        this.namedImportStructure = {
            moduleSpecifier,
            namedImports: [this.identifierName],
        };
    }

    public replaceImportTypeWithReferenceType(): void {
        this.importTypeNode.replaceWithText(this.identifierName);
    }
}
