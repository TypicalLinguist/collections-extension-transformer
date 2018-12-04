export class ModuleSpecifierHelper {
    public static stripQuotations(text: string): string {
        return text.replace(/["`']/g, "");
    }

    public static stripTsExtension(filePath: string): string {
        return filePath.replace(/(\.ts){1}/g, "");
    }
}