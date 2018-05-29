import {SourceFile} from "ts-simple-ast";
import {createVirtualSourceFile, writeCodeWith} from "../../helpers/sourceFileMockHelper";
import {arrayLiteral, newArrayExpression} from "../../helpers/codeMocks";
import {arrayLiteralToNewArrayExpression} from "../../../source/main/transforms/arrayLiteralToNewArrayExpression";

UnitUnderTest(`arrayLiteralToNewArrayExpression`, function () {
    Given(`a source file that contains an array literal`, function () {
        let sourceFile: SourceFile, expectedFileContent: string;

        beforeEach(function () {
            const codeWithArrayLiteral = writeCodeWith(arrayLiteral);
            sourceFile = createVirtualSourceFile(codeWithArrayLiteral);
            expectedFileContent = writeCodeWith(newArrayExpression)
        });

        When(`the arrayLiteralToNewArrayExpression() function is executed on the source file`, function () {
            let outputFileContent: string;

            beforeEach(function () {
                outputFileContent = arrayLiteralToNewArrayExpression(sourceFile).getText()
            });

            Then(`the array literal should have been transformed to a new Array() expression`, function () {
                expect(outputFileContent).to.equal(expectedFileContent)
            });
        })
    });

    Given(`a source file that does not contain an array literal`, function () {
        let sourceFile: SourceFile, expectedFileContent: string;

        beforeEach(function () {
            const codeWithArrayLiteral = writeCodeWith(newArrayExpression);
            sourceFile = createVirtualSourceFile(codeWithArrayLiteral);
            expectedFileContent = writeCodeWith(newArrayExpression)
        });

        When(`the arrayLiteralToNewArrayExpression() function is executed on the source file`, function () {
            let outputFileContent: string;

            beforeEach(function () {
                outputFileContent = arrayLiteralToNewArrayExpression(sourceFile).getText()
            });

            Then(`the source file should remain the same`, function () {
                expect(outputFileContent).to.equal(expectedFileContent)
            });
        })
    })
});


