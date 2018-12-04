import {ScopeChildAbleNode} from "./ScopeDeclaration";
import {Node, TypeGuards} from "ts-simple-ast";

declare module "ts-simple-ast" {
    export namespace TypeGuards {
        export function isScopeChildAbleNode(node: Node): node is ScopeChildAbleNode;
    }
}

TypeGuards.isScopeChildAbleNode = function(node: Node): node is ScopeChildAbleNode {
    return TypeGuards.isNamespaceChildableNode(node);
};