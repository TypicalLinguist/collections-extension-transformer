import {ArrayLiteralExpression, Expression, NewExpression, Node} from "ts-simple-ast";

export {createNewArrayExpression, isNewMapExpression};

function createNewArrayExpression(arrayLiteral: ArrayLiteralExpression): NewExpression {
    const elements = arrayLiteral.getElements();
    const typeText = buildTypeText(arrayLiteral);
    const elementsText = getElementsText(elements);
    const newText = `new Array<${typeText}>(${elementsText.join(", ")})`;

    return arrayLiteral.replaceWithText(newText) as NewExpression;
}

function getElementsText(elements: Expression[]): string[] {
    return elements.map((element) => element.getText());
}

function getNewMapType(map: NewExpression): string {
    return map.getTypeArguments()
        .map((argument) => argument.getText())
        .join(" | ");
}

function isNewMapExpression(node: Node): boolean {
    return node &&
        node instanceof NewExpression &&
        node.getExpression().getText() === "Map";
}

export function removeFullyQualifiedPartsFromType(typeString: string): string {
    return typeString
        .split(" | ")
        .map((subStr) => {
            if (subStr.startsWith("import(")) {
                return subStr.split(").")[1];
            } else {
                return subStr;
            }
        }).join(" | ");
}

function buildTypeText(arrayLiteral: ArrayLiteralExpression): string {
    let typeString: string;

    const parent = arrayLiteral.getParent();
    const grandParent = parent.getParent();

    if (isNewMapExpression(parent)) {
        typeString = "any";
    } else if (isNewMapExpression(grandParent)) {
        typeString = getNewMapType(grandParent as NewExpression);
    } else {
        typeString = arrayLiteral.getType().getTypeArguments()[0].getText();
    }

    typeString = removeFullyQualifiedPartsFromType(typeString);

    return typeString;
}
