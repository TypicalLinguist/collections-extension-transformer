import {ScopeChildAbleNode, ScopeDeclaration, ScopeDeclarationKind} from "./ScopeDeclaration";
import {NamespaceDeclarationKind, Node, SourceFile, TypeGuards} from "ts-simple-ast";
import "./isScopChildAble";

TypeGuards.isScopeChildAbleNode = function(node: Node): node is ScopeChildAbleNode {
    return TypeGuards.isNamespaceChildableNode(node);
};

export function main(sourceFiles: SourceFile[]): void {
    sourceFiles.forEach((sourceFile) => {
        visit(sourceFile.getChildren());
    });
}

function visit(nodes: Node[]): void {
    nodes.forEach((node) => {
        visit(node.getChildren());
        if (TypeGuards.isNamespaceChildableNode(node)) {
            (node as any as ScopeChildAbleNode).getParentScope = function() {
                const parentNamespace = node.getParentNamespace();

                if (parentNamespace) {
                    (parentNamespace as any).getScopeDeclarationKind = function() {
                        switch (parentNamespace.getDeclarationKind()) {
                            case NamespaceDeclarationKind.Global :
                                return ScopeDeclarationKind.Global;
                            case NamespaceDeclarationKind.Module :
                                return ScopeDeclarationKind.Module;
                            case NamespaceDeclarationKind.Namespace:
                                return ScopeDeclarationKind.Namespace;
                        }
                    }
                }

                return parentNamespace as ScopeDeclaration;
            };
        }
    });
}
