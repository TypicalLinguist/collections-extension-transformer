import {
    CallExpression,
    FunctionDeclaration,
    Node,
    ParameterDeclarationStructure,
    SourceFile,
    SyntaxKind,
} from "ts-simple-ast";

export function expectedArrayTransform(sourceFile: SourceFile): SourceFile {
    visit(sourceFile.getChildren(), sourceFile);
    return sourceFile;
}

function visit(nodes: Node[], sourceFile: SourceFile): void {
    nodes.forEach((child) => {
        const children = child.getChildren();

        visit(children, sourceFile);

        if (child instanceof CallExpression) {
            const parameterHandler = new ParameterHandler(child);
            parameterHandler.transformArrayToNativeArrayWhereExpected();
        }
    });
}

class ParameterHandler {
    constructor(public callExpression: CallExpression) {
        this.declaredParameters = this.getExpectedParameters();

        if (this.hasDeclaredParameters()) {
            this.actualParameters = this.getActualParameters();
        }
    }

    private get actualArrayParameter(): Node[] {
        if (this.hasActualParameters()) {
            return this.actualParameters.filter((actualParameter) => {
                const type = actualParameter.getType();
                const symbol = type.getSymbol();
                return symbol && symbol.getName() === "Array";
            });
        } else {
            return [];
        }
    }

    public transformArrayToNativeArrayWhereExpected(): void {
        this.actualArrayParameter.forEach((arrayParameter) => {
            arrayParameter.replaceWithText(`[...${arrayParameter.getText()}]`);
        });
    }

    private hasDeclaredParameters(): boolean {
        return this.declaredParameters && this.declaredParameters.length > 0;
    }

    private hasActualParameters(): boolean {
        return this.hasActualParameters && this.hasActualParameters.length > 0;
    }

    private getActualParameters(): Node[] {
        return this.callExpression.getChildrenOfKind(SyntaxKind.SyntaxList)[0]
            .getChildren()
            .filter((syntaxListChild) => syntaxListChild.getKind() !== SyntaxKind.CommaToken);
    }

    private getExpectedParameters(): ParameterDeclarationStructure[] | undefined {
        const type = this.callExpression.getChildren()[0].getType();

        if (type) {
            const symbol = type.getSymbol();
            if (symbol) {
                const declarations = symbol.getDeclarations();
                if (declarations.length > 0) {
                    const functionDeclarations = declarations
                        .filter((declaration) => declaration instanceof FunctionDeclaration);

                    if (functionDeclarations.length > 0) {
                        const structure = (functionDeclarations[0] as FunctionDeclaration).getStructure();
                        return structure.parameters.filter((parameter) => typeof parameter.type === "string");
                    }
                }
            }
        }

        return undefined;
    }

    private readonly declaredParameters: ParameterDeclarationStructure[];
    private readonly actualParameters: Node[];
}
