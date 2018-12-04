import {
    ArrayLiteralExpression,
    ArrayTypeNode,
    CallExpression,
    Node,
    SourceFile,
    SyntaxKind,
    TupleTypeNode,
    TypeNode,
} from "ts-simple-ast";
import {arrayLiteralToNewArrayExpression} from "./arrayLiteral/arrayLiteralToNewArrayExpression";
import {arrayLiteralReturnTypesToArray} from "./arrayLiteralReturnTypes/arrayLiteralReturnTypesToArray";
import {buildArrayTypeNodeTypeText} from "./arrayLiteralType/arrayLiteralTypeToArrayType";
import {CollectionTypeNodeWrapperFactory} from "./arrayLiteralReturnTypes/TypeNodeWrappers/CollectionTypeNodeWrapperFactory";

export function arrayLiteralToArray(sourceFile: SourceFile): SourceFile {
    if (!sourceFile.isDeclarationFile()) {
        visit(sourceFile.getChildren(), sourceFile);
    }
    return sourceFile;
}

function isGrandParentNewMapExpression(child: Node): boolean {
    const parent = child.getParent();
    const hasParent = (parent !== undefined && parent !== null);
    if (hasParent) {
        const grandParent = parent.getParent();
        const hasGrandParent = (grandParent !== undefined && grandParent !== null);
        if (hasGrandParent) {
            const baseTypes = grandParent.getType().getBaseTypes();
            if (baseTypes.length === 1) {
                return baseTypes[0].getSymbol().getName() === "Map";
            } else {
                return false;
            }
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function visit(nodes: Node[], sourceFile: SourceFile): void {
    nodes.forEach((child) => {
        const children = child.getChildren();

        visit(children, sourceFile);

        if (child instanceof ArrayTypeNode || child instanceof TupleTypeNode) {
            const typeNodeWrapper = CollectionTypeNodeWrapperFactory.createTypeNodeWrapper(child as TypeNode);

            const parameterDeclarationParent = typeNodeWrapper.getParentParameter();

            if (parameterDeclarationParent) {
                const childrenOfKind = parameterDeclarationParent.getChildrenOfKind(SyntaxKind.DotDotDotToken);
                if (!(childrenOfKind.length === 1)) {
                    const typeText = buildTypeText(child);
                    child.replaceWithText(typeText);
                }
            } else {
                const typeText = buildTypeText(child);
                child.replaceWithText(typeText);
            }

        } else if (child instanceof CallExpression) {
            arrayLiteralReturnTypesToArray(child);
        } else if (child instanceof ArrayLiteralExpression &&
            !isGrandParentNewMapExpression(child) &&
            !isAssignmentToTuple(child)) {

            arrayLiteralToNewArrayExpression(child as ArrayLiteralExpression);
        }
    });
}

function isAssignmentToTuple(child: ArrayLiteralExpression): boolean {
    return child.getType().isTuple();
}

function buildTupleTypeText(child: TupleTypeNode): string {
    let typeText = child.getElementTypeNodes().map((typeNode) => {
        return typeNode.getText();
    }).join(", ");

    typeText = `[${typeText}]`;

    return typeText;
}

export function buildTypeText(child: ArrayTypeNode | TupleTypeNode): string {
    let typeText: string;

    if (child instanceof ArrayTypeNode) {
        typeText = buildArrayTypeNodeTypeText(child);
    } else {
        typeText = buildTupleTypeText(child);
    }

    return typeText;
}
