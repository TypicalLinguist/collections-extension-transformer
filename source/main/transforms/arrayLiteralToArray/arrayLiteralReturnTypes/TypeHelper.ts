import {Type} from "ts-simple-ast";

export class TypeHelper {
    public static isNativeArray(type: Type): boolean {
        return type.isArray() && !this.isTypicalLinguistType(type);
    }

    public static isTypicalLinguistType(type: Type): boolean {
        return type.getText().includes("@typical-linguist");
    }
}