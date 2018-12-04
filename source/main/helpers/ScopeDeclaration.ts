import {NamespaceDeclaration, NamespaceDeclarationKind, Node} from "ts-simple-ast";

export interface ScopeDeclaration extends NamespaceDeclaration {
    getScopeDeclarationKind(): ScopeDeclarationKind;
}

export enum ScopeDeclarationKind {
    Module = NamespaceDeclarationKind.Module,
    Global = NamespaceDeclarationKind.Global,
    Namespace = NamespaceDeclarationKind.Namespace,
}

export interface ScopeChildAbleNode extends Node {
    getParentScope(): ScopeDeclaration;
}

export function isScopeDeclaration(node: Node): boolean {
    return (node instanceof NamespaceDeclaration);
}
