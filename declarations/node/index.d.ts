declare namespace NodeJS {
    import ExpectStatic = Chai.ExpectStatic;

    export interface Global {
        sinon: sinon;
        expect: ExpectStatic;
    }

    export interface Process extends EventEmitter {
        exit: (exitCode?: number) => void;
        on: (event: string, func: () => void) => void;
    }
}
