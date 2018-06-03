import {blue, green, grey, red, underline, yellow} from "colors/safe";

export {getCompareFilesMessage};

function getCompareFilesMessage(diffMap: Map<string, string[]>): string {
    const expected = `
            ${red(`Expected the typescript files to be the same, but they are not.`)}
                ${blue("\u2588\u2588\ Expected")}
                ${green("\u2588\u2588 Actual")}
                ${grey("\u2588\u2588 No difference")}
    `;

    const diffMessages: string[] = [];

    if (diffMap !== undefined) {
        diffMap.forEach((diffArray, filename) => {
            diffMessages.push(`
                ${underline(yellow(`Filename: ${filename}`))}
                        ${diffArray.join("").replace(/(?:\r\n|\r|\n)/g, "\n\t\t\t")}`);
        });
    }

    let diffs: string;

    if (diffMessages.length > 0) {
        diffs = diffMessages.reduce((previousValue, currentValue) => {
            return previousValue + currentValue;
        });
    }

    return expected + diffs;
}
