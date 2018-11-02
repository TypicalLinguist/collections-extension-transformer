import {Diagnostic, DiagnosticCategory} from "ts-simple-ast";

export function checkForErrors(diagnostics: Diagnostic[]): boolean {
    return diagnostics.map((diagnostic) => {
        return hasError(diagnostic);
    }).includes(true);
}

function hasError(diagnostic: Diagnostic): boolean {
    return diagnostic.getCategory() === DiagnosticCategory.Error;
}
