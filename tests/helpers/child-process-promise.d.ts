declare module 'child-process-promise' {
    import {ChildProcess, SpawnOptions} from "child_process";

    export function spawn(command: string, args?: ReadonlyArray<string>, options?: SpawnOptions): SpawnResponse;

    export interface SpawnResponse extends Promise<void> {
        childProcess: ChildProcess
    }
}