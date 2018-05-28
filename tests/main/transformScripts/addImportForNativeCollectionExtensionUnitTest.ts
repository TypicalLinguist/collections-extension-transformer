import {default as Project, SourceFile} from "ts-simple-ast";
import {createVirtualSourceFile} from "../../helpers/sourceFileHelper";
import {TypescriptWriter} from "../../helpers/TypescriptWriter";
import {addImportForNativeCollectionExtension} from "../../../source/main/transformScripts/addImportForNativeCollectionExtension";

UnitUnderTest(`addImportForNativeCollectionExtension`, function () {
    Given(`a source file`, function () {
        let sourceFile: SourceFile, expectedFileContent: string;

        beforeEach(function () {
            const startContent = `let a = 'a variable declaration'`;
            sourceFile = createVirtualSourceFile(startContent);
            const project = (new Project());
            const typescriptWriter = new TypescriptWriter();

            expectedFileContent = typescriptWriter.writeImportDeclaration(
                {
                    namedImports: ['Array'],
                    moduleSpecifier: 'native-collection-extension'
                }
            )
                .blankLine()
                .writeLine(startContent)
                .toString()
        });

        When(`when addImportForNativeCollectionExtension is executed`, function () {
            let outputFileContent: string;

            beforeEach(function () {
                outputFileContent = addImportForNativeCollectionExtension(sourceFile).getText()
            });

            Then(`the 'native-collection-extension' module import should be added`, function () {
                expect(outputFileContent).to.equal(expectedFileContent)
            })
        })
    })
});