export const myCarInitializer = 'let myCar: Car = { gears: 6 };';
export const arrayLiteral = "let a = [1, 2, [4, 5], 'monkey', myCar];";
export const newArrayExpression = `let a = new Array<1 | 2 | number[] | "monkey" | Car>(1, 2, [4, 5], 'monkey', myCar);`;

export type ExpressionUnderTest = typeof arrayLiteral | typeof newArrayExpression;