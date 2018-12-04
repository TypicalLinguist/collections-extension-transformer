import {Symbol, TypeGuards} from "ts-simple-ast";
import {ScopeDeclaration, ScopeDeclarationKind} from "./ScopeDeclaration";

export type NamespaceDeclaration = ScopeDeclaration;

export type ModuleDeclaration = ScopeDeclaration;

export class ScopeHelper {
    public static getNamespaceDeclarationWhereSymbolIsDefined(symbol: Symbol): NamespaceDeclaration | undefined {
        const symbolDeclaration = symbol.getDeclarations()[0];
        if (TypeGuards.isScopeChildAbleNode(symbolDeclaration)) {
            const scopeDeclaration = symbolDeclaration.getParentScope();

            if (this.isNamespaceDeclaration(scopeDeclaration)) {
                return scopeDeclaration as NamespaceDeclaration;
            } else {
                return undefined;
            }
        }
        return undefined;
    }

    public static getModuleDeclarationWhereSymbolIsDefined(symbol: Symbol): ModuleDeclaration | undefined {
        const symbolDeclaration = symbol.getDeclarations()[0];
        if (TypeGuards.isScopeChildAbleNode(symbolDeclaration)) {
            const scopeDeclaration = symbolDeclaration.getParentScope();

            if (this.isModuleDeclaration(scopeDeclaration)) {
                return scopeDeclaration as NamespaceDeclaration;
            } else {
                return undefined;
            }
        }
        return undefined;
    }

    public static hasNamespaceDeclaration(symbol: Symbol): boolean {
        return this.getNamespaceDeclarationWhereSymbolIsDefined(symbol) !== undefined;
    }

    public static hasModuleDeclaration(symbol: Symbol): boolean {
        return this.getModuleDeclarationWhereSymbolIsDefined(symbol) !== undefined;
    }

    public static hasScopedDeclaration(symbol: Symbol): boolean {
        return TypeGuards.isScopeChildAbleNode(symbol.getDeclarations()[0]);
    }

    private static isNamespaceDeclaration(scopeDeclaration: ScopeDeclaration): boolean {
        return scopeDeclaration && scopeDeclaration.getScopeDeclarationKind() === ScopeDeclarationKind.Namespace;
    }

    private static isModuleDeclaration(scopeDeclaration: ScopeDeclaration): boolean {
        return scopeDeclaration && scopeDeclaration.getScopeDeclarationKind() === ScopeDeclarationKind.Module;
    }
}
