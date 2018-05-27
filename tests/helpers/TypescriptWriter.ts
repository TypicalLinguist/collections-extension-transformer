import {CodeBlockWriter, InterfaceDeclarationStructure} from "ts-simple-ast";

export class TypescriptWriter extends CodeBlockWriter {
    writeInterface(structure: InterfaceDeclarationStructure) {
        this.writeLine(`interface ${structure.name}`)
            .block(() => {
                structure.properties.forEach(({name, type}) => {
                    this.writeLine(`${name} : ${type}`)
                })
            });
        return this;
    }
}