// import 'ts-simple-ast';
import ExpectStatic = Chai.ExpectStatic;

declare let expect: ExpectStatic;

declare namespace NodeJS {
    import ExpectStatic = Chai.ExpectStatic;

    export interface Global {
        expect: ExpectStatic
    }
}

