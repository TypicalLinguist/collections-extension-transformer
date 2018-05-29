import {default as Project, SourceFile} from "ts-simple-ast";
import {createVirtualSourceFile} from "../../helpers/sourceFileMockHelper";
import {TypescriptWriter} from "../../helpers/TypescriptWriter";
import {collectionsExtensionImport} from "../../../source/main/transforms/collectionsExtensionImport";

UnitUnderTest(`collectionsExtensionImport`, function () {
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
                    moduleSpecifier: '@typical-linguist/collections-extension'
                }
            )
                .blankLine()
                .writeLine(startContent)
                .toString()
        });

        When(`the collectionsExtensionImport() function is executed`, function () {
            let outputFileContent: string;

            beforeEach(function () {
                outputFileContent = collectionsExtensionImport(sourceFile).getText()
            });

            Then(`the '@typical-linguist/collections-extension' module import should be added`, function () {
                expect(outputFileContent).to.equal(expectedFileContent)
            })
        })
    })
});