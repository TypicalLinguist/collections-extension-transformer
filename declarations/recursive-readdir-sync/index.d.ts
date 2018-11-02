declare module "recursive-readdir-sync" {
    function recursiveReadDirSync(directoryName: string): string[];

    export = recursiveReadDirSync;
}
