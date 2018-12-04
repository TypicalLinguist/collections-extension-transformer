import {ArrayLiteralExpression, ConstructorTypeNode, NewExpression, SyntaxKind, TypeReferenceNode} from "ts-simple-ast";
import {NewArrayExpressionWrapper} from "./NewExpressions/NewArrayExpressionWrapper";

export class ArrayLiteralExpressionWrapper {
    public constructor(public readonly arrayLiteral: ArrayLiteralExpression) {

    }

    public toNewArrayExpression(): NewArrayExpressionWrapper {
        const typeText = this.getTypeText();
        const elementsText = this.getElementsText();
        const newText = `new Array<${typeText}>(${elementsText})`;

        const newExpression = this.arrayLiteral.replaceWithText(newText) as NewExpression;
        return new NewArrayExpressionWrapper(newExpression);
    }

    private getTypeText(): string {
        if (this.isEmpty()) {
            return this.buildEmptyArrayTypeText();
        } else {
            return this.buildNewArrayTypeText();
        }
    }

    private getElementsText(): string {
        return this.arrayLiteral.getElements().map((element) => element.getText()).join(", ");
    }

    private isEmpty(): boolean {
        return this.arrayLiteral.getElements().length === 0;
    }

    private buildEmptyArrayTypeText(): string {
        const arrayLiteralTypeReference = this.getTypeNode();

        if (arrayLiteralTypeReference) {
            return arrayLiteralTypeReference.getTypeArguments()[0].getText();
        } else {
            return "any";
        }
    }

    private getTypeNode(): TypeReferenceNode | undefined {
        const variableDeclarationParent = this.arrayLiteral.getParentIfKind(SyntaxKind.VariableDeclaration);

        if (variableDeclarationParent) {
            const typeReferences = variableDeclarationParent.getChildren()
                .filter((child) => child instanceof TypeReferenceNode) as TypeReferenceNode[];

            return typeReferences.find((typeReference) => {
                const typeReferenceChildren = typeReference.getChildren();
                if (typeReferenceChildren) {
                    return typeReferenceChildren
                        .find((child) => {
                            console.log(child.getKindName());
                            return child.getText() === "Array";
                        }) !== undefined;
                } else {
                    return undefined;
                }
            });
        }
        return undefined;
    }

    private buildNewArrayTypeText(): string {
        let typeString: string;

        const parent = this.arrayLiteral.getParent();
        const grandParent = parent.getParent();

        if (NewArrayExpressionWrapper.canBeInstantiatedWith(parent)) {
            typeString = "any";
        } else if (NewArrayExpressionWrapper.canBeInstantiatedWith(grandParent)) {
            typeString = getNewMapType(grandParent as NewExpression);
        } else {
            typeString = this.arrayLiteral.getType().getTypeArguments()[0].getText();
        }

        return typeString;
    }
}

function getNewMapType(map: NewExpression): string {
    return map.getTypeArguments()
        .map((argument) => {
            if (argument instanceof ConstructorTypeNode) {
                return `(${argument.getText()})`;
            }
            return argument.getText();
        })
        .join(" | ");
}