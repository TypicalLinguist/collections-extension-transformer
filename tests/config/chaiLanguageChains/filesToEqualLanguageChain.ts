import * as assert from "assert";
import {blue, green, grey} from "colors/safe";
import {diffChars, IDiffResult} from "diff";
import {getCompareFilesMessage} from "../../helpers/assertionMessageTemplates/compareFiles";

export function filesToEqualLanguageChain(chai: any, utils: any): void {
    const Assertion: any = chai.Assertion;

    Assertion.addProperty("files", function(): void {
        utils.flag(this, "files", true);
    });

    Assertion.overwriteMethod("equal", function(originalEqual: any): any {
        return function(expectedTs: Map<string, string>): void {
            if (utils.flag(this, "files")) {
                fileEqualityAssertion.call(this, expectedTs);
            } else {
                originalEqual.apply(this, arguments);
            }
        };
    });
}

function generateColorCodedLinesDiffs(linesDiffs: IDiffResult[]): string[] {
    return linesDiffs.map((part) => {
        if (part.added) {
            return green(part.value);
        } else if (part.removed) {
            return blue(part.value);
        } else {
            return grey(part.value);
        }
    });
}

function generateColorCodedDiffs(lineDiffsRaw: IDiffResult[], fileName: string): Map<string, string[]> {
    const fileDiffs: Map<string, string[]> = new Map();
    const lineDiffs: string[] = generateColorCodedLinesDiffs(lineDiffsRaw);
    fileDiffs.set(fileName, lineDiffs);
    return fileDiffs;
}

function fileEqualityAssertion(expectedFiles: Map<string, string>): void {
    const actualFiles: Map<string, string> = this._obj;

    let colorCodeFilesDiffs: Map<string, string[]>;
    const hasDifferencesArray: boolean[] = [];

    actualFiles.forEach((actual, fileName) => {
        const expected = expectedFiles.get(fileName);
        const linesDiffs = diffChars(expected, actual).filter(isNotOnlyNewlineOrSpace);
        const changedLines = linesDiffs.filter((part) => {
            const changed = (part.added || part.removed);
            return changed;
        });

        const hasDifferences = changedLines.length > 0;

        if (hasDifferences) {
            colorCodeFilesDiffs = generateColorCodedDiffs(linesDiffs, fileName);
        }

        hasDifferencesArray.push(hasDifferences);
    });

    assert(
        !hasDifferencesArray.includes(true),
        getCompareFilesMessage(colorCodeFilesDiffs),
    );
}

function isNotOnlyNewlineOrSpace(part: IDiffResult): boolean {
    const spaceOrNewLine = part.value.match(/ |\n/g);
    const containsOnlySpacesAndNewlines = spaceOrNewLine && spaceOrNewLine.length === part.value.length;
    return !containsOnlySpacesAndNewlines;
}
