import {
    ArrayLiteralExpression,
    ArrayTypeNode,
    CallExpression,
    CodeBlockWriter,
    Expression,
    NewExpression,
    Node,
    SourceFile,
    Type,
    TypeNode,
} from "ts-simple-ast";

export function arrayLiteralToNewArrayExpression(sourceFile: SourceFile): SourceFile {
    visit(sourceFile.getChildren(), sourceFile);
    visitArrayTypeNode(sourceFile.getChildren(), sourceFile);

    return sourceFile;
}

function getTypeNames(elements: Expression[]): string[] {
    return elements.map((element) => {
        return element.getType().getBaseTypeOfLiteralType().getText();
    });
}

function getElementsText(elements: Expression[]): string[] {
    return elements.map((element) => element.getText());
}

function establishTypeString(arrayLiteral: ArrayLiteralExpression, elements: Expression[]): string {
    let typeString: string;

    const parent = arrayLiteral.getParent();
    const grandParent = parent.getParent();

    if (parent instanceof NewExpression && parent.getExpression().getText() === "Map") {
        typeString = "any";
    } else if (
        grandParent !== undefined &&
        grandParent instanceof NewExpression &&
        grandParent.getExpression().getText() === "Map"
    ) {
        typeString = grandParent.getTypeArguments()
            .map((argument) => argument.getText())
            .join(" | ");
    } else {
        const typesNames = getTypeNames(elements);
        const uniqueTypeNames = Array.from(new Set<string>(typesNames));
        typeString = uniqueTypeNames.join(" | ");
    }
    return typeString;
}

function writeCode(codeWriter: CodeBlockWriter, arrayLiteral: ArrayLiteralExpression): void {
    const elements = arrayLiteral.getElements();
    const typeString = establishTypeString(arrayLiteral, elements);
    const elementsText = getElementsText(elements);

    codeWriter.write(`new Array<${typeString}>(${elementsText.join(", ")})`);
}

class ResolvedType {
    constructor(public isArrayType: boolean,
                public originalTypeText: string,
                public type: Type | ResolvedType | ResolvedType[],
                public text: string) {
    }
}

function buildResolvedTypeTree(type: Type, typeText?: string): ResolvedType {
    const typeArguments = type.getTypeArguments();

    if (typeArguments.length > 0) {
        let originalTypeText: string;
        const resolvedType = typeArguments.map((typeArgument) => {
            return buildResolvedTypeTree(typeArgument, type.isArray() ? typeText : undefined);
        });

        let text: string;

        if (type.isArray()) {
            originalTypeText = typeText ? `(${typeText})[]` : type.getText();
            text = `(${resolvedType.map((child) => child.text).join(" | ")})[]`;
        } else {
            originalTypeText = typeText || type.getText();
            text = resolvedType.map((child) => child.text).join(" | ");
        }

        return {
            isArrayType: type.isArray(),
            originalTypeText,
            text,
            type: resolvedType,
        };
    } else if (type.isUnion()) {
        const resolvedType = type.getUnionTypes().map((childType) => {
            return buildResolvedTypeTree(childType);
        });

        return {
            isArrayType: false,
            originalTypeText: typeText || type.getText(),
            text: resolvedType.map((child) => child.text).join(" | "),
            type: resolvedType,
        };
    } else {
        return {
            isArrayType: false,
            originalTypeText: typeText || type.getText(),
            text: type.getText(),
            type,
        };
    }
}

function arraysMatch(resolvedTypes: ResolvedType[], types: Type[]): boolean {
    const matches = !types.map((type) => {
        let result: boolean = false;

        resolvedTypes.forEach((resolvedType) => {
            if (type.getText() === resolvedType.text) {
                result = true;
            }
        });

        return result;
    }).includes(false);
    return matches;
}

function findMatchInMultipleTrees(trees: ResolvedType[], type: Type): string | undefined {
    return trees.map((childTree) => {
        return findMatchingTypeInResolvedTypeTree(childTree, type);
    }).reduce((previousValue, currentValue) => {
        if (previousValue) {
            return previousValue;
        } else {
            return currentValue;
        }
    });
}

function findMatchingTypeInResolvedTypeTree(resolvedTypeTree: ResolvedType, type: Type): string | undefined {
    const typeHasTypeArguments = type.getTypeArguments().length > 0;

    if (!type.isUnion() && !typeHasTypeArguments) {
        return undefined;
    } else if (resolvedTypeTree.type instanceof Array) {
        if (type.isUnion()) {
            if (resolvedTypeTree.isArrayType) {
                return findMatchInMultipleTrees(resolvedTypeTree.type, type);
            } else {
                if (arraysMatch(resolvedTypeTree.type, type.getUnionTypes())) {
                    return resolvedTypeTree.originalTypeText;
                } else {
                    return findMatchInMultipleTrees(resolvedTypeTree.type, type);
                }
            }
        } else if (typeHasTypeArguments) {
            if (resolvedTypeTree.isArrayType) {
                if (arraysMatch(resolvedTypeTree.type, type.getTypeArguments())) {
                    return resolvedTypeTree.originalTypeText;
                } else {
                    return findMatchInMultipleTrees(resolvedTypeTree.type, type);
                }
            } else {
                return findMatchInMultipleTrees(resolvedTypeTree.type, type);
            }
        } else {
            return undefined;
        }
    } else {
        return undefined;
    }
}

function replaceWithNewArrayExpression(arrayLiteral: ArrayLiteralExpression, sourceFile: SourceFile): Node {
    const newNode = arrayLiteral.replaceWithText((writer) => writeCode(writer, arrayLiteral)) as NewExpression;

    let typeText: string;
    const parent = newNode.getParent();

    if (parent instanceof NewExpression && parent.getExpression().getText() === "Map") {
        const typeArguments = parent.getTypeArguments();
        typeText = typeArguments.map((arg) => arg.getText()).join(" | ");
    } else {
        typeText = newNode.getTypeArguments()[0].getText(); // this is safe because it's always a new Array argument
    }

    const resolvedTypeTree = buildResolvedTypeTree(newNode.getType(), typeText);

    const arrayInitializerArguments = newNode.getArguments();

    arrayInitializerArguments.forEach((arrayInitializerArgument) => {
        if (arrayInitializerArgument instanceof NewExpression) {
            const arrayInitializerNewExpressionTypes = arrayInitializerArgument.getType().getTypeArguments();

            arrayInitializerNewExpressionTypes.forEach((arrayInitializerNewExpressionType, index) => {
                let matchingType = findMatchingTypeInResolvedTypeTree(resolvedTypeTree,
                    arrayInitializerNewExpressionType);

                if (matchingType) {
                    matchingType = matchingType.replace(/UnionReferenceType\[]/g, "SectionValueType"); // TODO: Remove

                    arrayInitializerArgument.removeTypeArgument(index);
                    arrayInitializerArgument.insertTypeArgument(index, matchingType);
                }
            });
        }
    });

    const args = newNode.getArguments();

    return newNode;
}

function visit(nodes: Node[], sourceFile: SourceFile): void {
    nodes.forEach((child) => {
        const children = child.getChildren();

        visit(children, sourceFile);

        if (child instanceof ArrayLiteralExpression) {
            replaceWithNewArrayExpression(child as ArrayLiteralExpression, sourceFile);
        } else if (child instanceof CallExpression) {
            if (child.getReturnType().isArray() && !child.getReturnType().getText().includes("@typical-linguist")) {
                const oldCallExpression = child.getFullText();
                const arrayType = child.getReturnType().getArrayType().getText()
                child.replaceWithText(`(${oldCallExpression} as Array<${arrayType}>)`);
            }
        }
    });
}

function visitArrayTypeNode(nodes: Node[], sourceFile: SourceFile): void {
    nodes.forEach((child) => {
        const children = child.getChildren();

        visitArrayTypeNode(children, sourceFile);

        if (child instanceof TypeNode) {
            const typeArgs = child.getType().getTypeArguments();
            let text = child.getText()
            if (text.startsWith("import(")) {
                text = text.split(").")[1];
                child.replaceWithText(text);
            }
        }

        if (child instanceof ArrayTypeNode) {
            const typeString = buildTypeString(child.getType());
            child.replaceWithText(typeString);
        }
    });
}

function buildTypeString(type: Type): string {
    if (type.isArray()) {
        const typeArgs = type.getTypeArguments();

        let subTypes: string;

        const aliasSymbol = typeArgs[0].getAliasSymbol();

        if (typeArgs[0].isUnion() && !aliasSymbol) {
            subTypes = typeArgs[0].getUnionTypes()
                .map((unionType) => buildTypeString(unionType))
                .join(" | ");

            return `Array<${subTypes}>`;
        } else if (typeArgs[0].isUnion() && aliasSymbol) {

            return `Array<${aliasSymbol.getName()}>`;
        }

        let text = typeArgs[0].getText();

        if (text.startsWith("import(")) {
            text = text.split(").")[1];
        }

        return `Array<${text}>`;
    } else {
        return type.getText();
    }
}
