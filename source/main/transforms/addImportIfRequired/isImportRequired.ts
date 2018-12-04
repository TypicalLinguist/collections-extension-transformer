import {SourceFile, Symbol, Type} from "ts-simple-ast";
import {ScopeHelper} from "../../helpers/ScopeHelper";
import {hasImport} from "./hasImport";

export function isImportRequired(type: Type, sourceFile: SourceFile): boolean {
    const symbol = type.getSymbol();
    return symbol
        && !isImportAll(symbol.getName())
        && !hasImport(sourceFile, symbol)
        && !isTypescriptLib(symbol)
        && !isGlobal(symbol)
        && !isLocal(sourceFile.getFilePath(), symbol);
}

function isLocal(sourceFilePath: string, symbol: Symbol): boolean {
    return symbol.getDeclarations()[0].getSourceFile().getFilePath() === sourceFilePath;
}

function isImportAll(symbolName: string): boolean {
    return (symbolName === "__object") || (symbolName === "__type");
}

function isGlobal(symbol: Symbol): boolean {
    return !ScopeHelper.hasScopedDeclaration(symbol);
}

function isTypescriptLib(symbol: Symbol): boolean {
    const symbolDeclarationFilePath = symbol.getDeclarations()[0].getSourceFile().getFilePath();
    return symbolDeclarationFilePath.includes("/node_modules/typescript/lib/");
}
