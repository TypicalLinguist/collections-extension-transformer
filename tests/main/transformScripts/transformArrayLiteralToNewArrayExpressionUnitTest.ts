import {SourceFile} from "ts-simple-ast";
import {createVirtualSourceFile, writeCodeWith} from "../../helpers/sourceFileHelper";
import {arrayLiteral, newArrayExpression} from "../../helpers/codeMocks";
import {transformArrayLiteralToNewArrayExpression} from "../../../source/main/transformScripts/transformArrayLiteralToNewArrayExpression";

UnitUnderTest(`transformArrayLiteralToNewArrayExpression`, function () {
    Given(`a source file that contains an array literal`, function () {
        let sourceFile: SourceFile, expectedFileContent: string;

        beforeEach(function () {
            const codeWithArrayLiteral = writeCodeWith(arrayLiteral);
            sourceFile = createVirtualSourceFile(codeWithArrayLiteral);
            expectedFileContent = writeCodeWith(newArrayExpression)
        });

        When(`transformArrayLiteralToNewArrayExpression is executed on the source file`, function () {
            let outputFileContent: string;

            beforeEach(function () {
                outputFileContent = transformArrayLiteralToNewArrayExpression(sourceFile).getText()
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

        When(`transformArrayLiteralToNewArrayExpression is executed on the source file`, function () {
            let outputFileContent: string;

            beforeEach(function () {
                outputFileContent = transformArrayLiteralToNewArrayExpression(sourceFile).getText()
            });

            Then(`the source file should remain the same`, function () {
                expect(outputFileContent).to.equal(expectedFileContent)
            });
        })
    })
});


