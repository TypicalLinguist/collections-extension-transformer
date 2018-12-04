import {ImportTypeNode, Node, SourceFile, Type, TypeNode} from "ts-simple-ast";
import {ImportFactory} from "./ImportFactory";
import {isImportRequired} from "./isImportRequired";

export function main(sourceFile: SourceFile): SourceFile {
    if (!sourceFile.isDeclarationFile()) {
        visit(sourceFile.getChildren());
    }

    return sourceFile;
}

function visit(nodes: Node[]): void {
    nodes.forEach((node) => {
        visit(node.getChildren());
        if (node instanceof TypeNode) {
            addImportIfRequired(node as TypeNode);
        }
    });
}

function addImportIfRequired(typeNode: TypeNode): void {
    if (isInlineImport(typeNode)) {
        addImportFormInlineImport(typeNode);
    } else {
        addImportFromType(typeNode.getType(), typeNode.getSourceFile());
    }
}

export function addImportFromType(type: Type, sourceFile: SourceFile): string {
    let typeText = type.getText();
    if (isImportRequired(type, sourceFile)) {
        const importObj = ImportFactory.createImport(sourceFile, type.getSymbol());
        typeText = importObj.insertIntoFileSafely();
    }

    return typeText;
}

function addImportFormInlineImport(typeNode: ImportTypeNode): void {
    if (isImportRequired(typeNode.getType(), typeNode.getSourceFile())) {
        const importObj = ImportFactory.createImportFromInlineImport(typeNode);
        importObj.insertIntoFileSafely();
        importObj.replaceImportTypeWithReferenceType();
    }
}

function isInlineImport(typeNode: TypeNode): typeNode is ImportTypeNode {
    return typeNode instanceof ImportTypeNode;
}