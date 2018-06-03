import {Diagnostic, DiagnosticCategory, DiagnosticMessageChain} from "ts-simple-ast";

export function checkForErrors(diagnostics: Diagnostic[]): string[] {
    return diagnostics.map((diagnostic) => {
        if (hasError(diagnostic)) {
            return extractErrorMessage(diagnostic);
        } else {
            return undefined;
        }
    }).filter((message) => message !== undefined);
}

function hasError(diagnostic: Diagnostic): boolean {
    return diagnostic.getCategory() === DiagnosticCategory.Error;
}

function extractErrorMessage(diagnostic: Diagnostic): string {
    let message = diagnostic.getMessageText();

    if (message instanceof DiagnosticMessageChain) {
        const diagnosticMessageChain = message as DiagnosticMessageChain;
        message = diagnosticMessageChain.getMessageText();
    }

    return message;
}
