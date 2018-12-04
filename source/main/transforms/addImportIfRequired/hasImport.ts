import {ImportDeclaration, SourceFile, Symbol} from "ts-simple-ast";
import {ScopeHelper} from "../../helpers/ScopeHelper";

export function hasImport(sourceFile: SourceFile, symbol: Symbol): boolean {
    const symbolDeclaration = symbol.getDeclarations()[0];
    const symbolDeclarationFilePath = symbolDeclaration.getSourceFile().getFilePath();

    const importDeclarations = sourceFile.getImportDeclarations() as ImportDeclaration[];
    return importDeclarations
        .map((importDeclaration) => {
                const moduleSpecifierSourceFile = importDeclaration.getModuleSpecifierSourceFile();

                return isSymbolImport(moduleSpecifierSourceFile,
                    symbolDeclarationFilePath,
                    importDeclaration,
                    symbol);

            },
        ).includes(true);
}

function isSymbolImport(moduleSpecifierSourceFile: SourceFile,
                        symbolDeclarationFilePath: string,
                        importDeclaration: ImportDeclaration,
                        symbol: Symbol): boolean {

    const hasNamedImport = importDeclaration.getNamedImports()
        .map((namedImport) => namedImport.getText())
        .includes(symbol.getName());

    if (moduleSpecifierSourceFile) {
        return isSymbolDeclarationInModuleSpecifierSourceFile(moduleSpecifierSourceFile.getFilePath(),
            symbolDeclarationFilePath,
            hasNamedImport,
            importDeclaration.getText());
    } else {
        const moduleNameOfModuleSpecifier = importDeclaration.getModuleSpecifier().getText().replace(/['"`]/g, "");
        if (hasNamedImport) {
            if (symbolDeclarationFilePath.includes(moduleNameOfModuleSpecifier)) {
                return true;
            } else {
                const specifierText = importDeclaration.getModuleSpecifier().getText().replace(/['"`]/g, "");
                const moduleDeclarationWhereSymbolIsDefined = ScopeHelper.getModuleDeclarationWhereSymbolIsDefined(symbol);
                return moduleDeclarationWhereSymbolIsDefined && specifierText === moduleDeclarationWhereSymbolIsDefined.getName().replace(/['"`]/g, "")
            }
        } else {
            return false
        }
    }
}

function isSymbolDeclarationInModuleSpecifierSourceFile(moduleSpecifierFullPath: string,
                                                        symbolDeclarationFilePath: string,
                                                        hasNamedImport: boolean,
                                                        importDeclarationText: string): boolean {

    let hasModuleSpecifier = (moduleSpecifierFullPath === symbolDeclarationFilePath);

    if (hasNamedImport && !hasModuleSpecifier) {
        hasModuleSpecifier = checkIfSameModule(moduleSpecifierFullPath, symbolDeclarationFilePath);
    }

    // TODO: Establish whether isImportAllDeclaration cause even makes sense. * as doesn't mean the symbol is
    // defined
    return (hasNamedImport) || (isImportAllDeclaration(importDeclarationText) && hasModuleSpecifier);
}

function checkIfSameModule(moduleSpecifierFullPath: string, symbolDeclarationFilePath: string): boolean {
    const modulePathRegEx = new RegExp(/\/node_modules\/@(\w+\/)?(\w+)?/g);
    const specifierModuleNameRegexMatches = moduleSpecifierFullPath.match(modulePathRegEx);
    const symbolModuleRegexMatches = symbolDeclarationFilePath.match(modulePathRegEx);

    if (symbolModuleRegexMatches !== null && specifierModuleNameRegexMatches !== null) {
        const specifierModuleName = specifierModuleNameRegexMatches[specifierModuleNameRegexMatches.length - 1];
        const symbolModuleName = symbolModuleRegexMatches[symbolModuleRegexMatches.length - 1];
        return specifierModuleName === symbolModuleName;
    } else {
        return false;
    }
}

function isImportAllDeclaration(importDeclarationText: string): boolean {
    return importDeclarationText.includes("* as");
}
