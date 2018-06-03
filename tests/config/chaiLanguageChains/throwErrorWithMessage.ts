let pass: boolean;

export function throwErrorWithMessage(chai: any, utils: any): void {
    const Assertion: any = chai.Assertion;

    Assertion.addMethod("throwErrorWithMessage", function(errorMessage: string): void {
        const func: () => void = this._obj as () => void;

        const negate = utils.flag(this, "negate");

        try {
            func();
        } catch (e) {
            const hasExpectedMessage = e.message === errorMessage;
            pass = negate ? !hasExpectedMessage : hasExpectedMessage;
            this.assert(
                pass,
                `\n\t expected ${func} to throw an Error with message: \n` +
                `\t\t ${errorMessage}\n` +
                `\t ${negate ? "NOT" : ""} to be thrown, but got Error with message:\n` +
                `\t\t ${e.message}`,
            );
        }
        if (!pass && !negate) {
            throw new Error(`expected \n\t ${func} \n\t to throw an Error with message: \n` +
                `\t\t ${errorMessage}\n` +
                `\t but it was never thrown.`,
            );
        }
    });
}
