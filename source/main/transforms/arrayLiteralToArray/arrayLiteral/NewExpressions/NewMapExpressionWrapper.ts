import {NewExpression, Node} from "ts-simple-ast";

export class NewMapArrayExpressionWrapper {
    protected constructor(protected readonly newExpression: NewExpression) {

    }

    public static canBeInstantiatedWith(node: Node): boolean {
        if (node instanceof NewExpression) {
            return node.getExpression().getText() === "Map";
        } else {
            return false;
        }
    }
}