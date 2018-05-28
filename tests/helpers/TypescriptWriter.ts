import {CodeBlockWriter, ImportDeclarationStructure, InterfaceDeclarationStructure} from "ts-simple-ast";

export class TypescriptWriter extends CodeBlockWriter {
    writeInterface(structure: InterfaceDeclarationStructure) {
        return this.writeLine(`interface ${structure.name}`)
            .block(() => {
                structure.properties.forEach(({name, type}) => {
                    this.writeLine(`${name} : ${type}`)
                })
            });
    }

    writeImportDeclaration(structure: ImportDeclarationStructure) {
        this.write('import')
            .space(1)
            .write('{')
            .space()

        structure.namedImports.forEach((namedImport, index) => {
            this.write(namedImport.toString())
                .conditionalWrite(index < structure.namedImports.length - 1, ', ')
        });

        this.space(1)
            .write('}')
            .space(1)
            .write(`from "${structure.moduleSpecifier}";`);

        return this
    }
}