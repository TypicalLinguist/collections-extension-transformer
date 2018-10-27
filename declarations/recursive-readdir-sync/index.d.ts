declare function recursiveReadDirSync(directoryName: string): string[];

declare module "recursive-readdir-sync" {
    export = recursiveReadDirSync;
}
