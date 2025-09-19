import { describe, it, expect } from 'vitest'
import { interpret } from '../src/flat/interpreter'

describe.skip('help dialog', () => {
    it('must print help', () => {
        const result = interpret("(help)");
        expect(result).toContain("help");
        expect(result).toContain("+");
        expect(result).toContain("-");
        expect(result).toContain("*");
        expect(result).toContain("/");
    });

    it.skip('should report an error when forgetting parenthesis for the "help" command', () => {
        const result = interpret("help");
        expect(result).toContain("error");
    });
});

describe('basic values', () => {
    it('must evaluate a single integer to itself', () => {
        expect(interpret("-1")).toBe(-1);
        expect(interpret("0")).toBe(0);
        expect(interpret("1")).toBe(1);
        expect(interpret("+1")).toBe(1);
    });

    it('must evaluate a single boolean to itself', () => {
        expect(interpret("true")).toBe(true);
        expect(interpret("false")).toBe(false);
    });
});

describe('valid input and output', () => {
    it('should tolerate extra whitespaces within an expression', () => {
        const result = interpret("  (  (  +  1  )  2  )  ");
        expect(result).toBe(3);
    });

    it('should tolerate newlines and tabs within an expression', () => {
        const result = interpret("(\n\t(\n\t+\n\t1\n\t)\n\t2\n\t)  ");
        expect(result).toBe(3);
    });

    it('must report an error if the input consists of more than one expression', () => {
        expect(() => interpret("1 2")).toThrowError(/expression/);
    });

    it('must report an error when calling a function with not enough arguments', () => {
        expect(() => interpret("(+ 1)")).toThrow(); // toThrowError(/argument/)
    });

    it('must report an error when calling a function with too many arguments', () => {
        expect(() => interpret("(((+ 1) 2) 3)")).toThrow(); // toThrowError(/argument/)
    });

    it('must report an error when evaluating undefined identifiers', () => {
        expect(() => interpret('x')).toThrow(); // toThrowError(/identifier/);
    });

    it('must report an error when calling undefined functions', () => {
        expect(() => interpret('(+++ 2 3)')).toThrow();
    });

    it.skip('should report an error when returning a function', () => {
        expect(() => interpret("+")).toThrow();
    });
});

describe('arithmetic and logical expressions', () => {
    it('must add two integers together', () => {
        const result = interpret("((+ 1) 2)");
        expect(result).toBe(3);
    });

    it("must evaluate logical 'not' expressions", () => {
        expect(interpret("(! true)")).toBe(false);
        expect(interpret("(! false)")).toBe(true);
    });

    it("must evaluate logical 'and' expressions", () => {
        const ff = interpret("((&& false) false)");
        expect(ff).toBe(false);

        const ft = interpret("((&& false) true)");
        expect(ft).toBe(false);

        const tf = interpret("((&& true) false)");
        expect(tf).toBe(false);

        const tt = interpret("((&& true) true)");
        expect(tt).toBe(true);
    });

    it("must evaluate logical 'or' expressions", () => {
        const ff = interpret("((|| false) false)");
        expect(ff).toBe(false);

        const ft = interpret("((|| false) true)");
        expect(ft).toBe(true);

        const tf = interpret("((|| true) false)");
        expect(tf).toBe(true);

        const tt = interpret("((|| true) true)");
        expect(tt).toBe(true);
    });
});

describe.skip('if-expression', () => {
    it('when the 1st expression is true, "if" must return the 2nd expression', () => {
        const result = interpret("(if true 4 8)");
        expect(result).toBe(4);
    });

    it('when the 1st expression is false, "if" must return the 3rd expression', () => {
        const result = interpret("(if false 4 8)");
        expect(result).toBe(8);
    });
});

describe.skip('nested expressions', () => {
    it('must evaluate left-nested addition', () => {
        const result = interpret("((+ ((+ 1) 2)) 3)");
        expect(result).toBe(6);
    });

    it('must evaluate right-nested addition', () => {
        const result = interpret("((+ 1 ((+ 2) 3)))");
        expect(result).toBe(6);
    });

    it('must forward error messages from nested functions', () => {
        expect(() => interpret('((+ 1) ((+++ 2) 3))')).toThrow(); // toThrowError(/\+\+\+/)
    });

    it('must report the first error to occur from nested functions', () => {
        expect(() => interpret('((+++ 1) (+ 2))')).toThrow(); // toThrowError(/\+\+\+/)
    });
});

describe('let-bindings', () => {
    it('must support variable binding', () => {
        expect(interpret('(let x 42 x)')).toBe(42);
        expect(interpret('(let x true x)')).toBe(true);
    });

    it('must support nested variable bindings', () => {
        expect(interpret('(let x 1 (let y 2 x))')).toBe(1);
        expect(interpret('(let x 1 (let y 2 y))')).toBe(2);
    });

    it.skip('must support nested variable bindings in nested expressions', () => {
        expect(interpret('(let x 1 (let y 2 ((+ x) y)))')).toBe(3);
    });

    it.skip('must support variable binding inside of nested expressions', () => {
        expect(interpret('(let x 41 ((+ x) 1))')).toBe(42);
        expect(interpret('(let x 1 ((+ x) ((* x) 2)))')).toBe(3);
    });

    it.skip('must support binding to built-in functions', () => {
        expect(interpret('(let add + ((add 1) 2))')).toBe(3);
    });

    it.skip('must support binding to lambda functions', () => {
        expect(interpret("(let increment (lambda x ((+ 1) x)) (increment 41))")).toBe(42);
    });

    it('must resolve shadowed variables correctly', () => {
        expect(interpret('(let x 1 (let x 2 x))')).toBe(2);
    });

    it('must report an error if the 1st argument the let-binding is not an identifier', () => {
        expect(() => interpret('(let 4 2 x)')).toThrow(); // toThrowError(/identifier/);
    });

    it('must report an error if the 2nd argument the let-binding contains undefined variables', () => {
        expect(() => interpret('(let x y x)')).toThrow(); // toThrowError(/identifier/);
    });

    it('must report an error if the 3rd argument the let-binding contains undefined variables', () => {
        expect(() => interpret('(let x 2 y)')).toThrow(); // toThrowError(/identifier/);
    });

    it('must report an error if a let-binding is provided too few arguments', () => {
        expect(() => interpret('(let x 42)')).toThrow(); // toThrowError(/argument/);
    });

    it('must report an error if a let-binding is provided too many arguments', () => {
        expect(() => interpret('(let x 2 x x)')).toThrow(); // toThrowError(/argument/);
    });
});

describe('lambdas', () => {
    it('must evaluate lambda expressions which are constant functions', () => {
        expect(interpret("((lambda x 42) 1)")).toBe(42);
    });

    it('must evaluate lambda expressions with one argument', () => {
        expect(interpret("((lambda x x) 1)")).toBe(1);
    });

    it.skip('must evaluate lambda expressions with nested expressions', () => {
        expect(interpret("((lambda a ((+ 1) a)) 2)")).toBe(3);
    });

    it('must evaluate nested lambda expressions', () => {
        expect(interpret("(((lambda a (lambda b a)) 1) 2)")).toBe(1);
    });

    it.skip('may evaluate lambda expressions with multiple arguments', () => {
        expect(interpret("((lambda [a b] a) [1 2])")).toBe(1);
    });
});

describe.skip('references', () => {
    it('must support creation of explicit references', () => {
        expect(interpret("(let x 40 (let y (ref x) ((+ y) 2)))")).toBe(42);
    });

    it('must report an an error when a reference is created implicitly', () => {
        expect(interpret("(let x 40 (let y x ((+ y) 2)))")).toContain("error");
    });
});


describe.skip('type system', () => {
    it('must report an error when implicitly converting to a boolean', () => {
        expect(interpret("(! 0)")).toContain("error");
        expect(interpret("(! 1)")).toContain("error");
        expect(interpret("(! +)")).toContain("error");
    });

    it('must report an error when implicitly converting to a string', () => {
        expect(interpret("((+ 1) (help))")).toContain("error");
        expect(interpret("((+ -) -)")).toContain("error");
    });

    it('must report an error when implicitly converting to a number', () => {
        expect(interpret("((* +) +)")).toContain("error");
    });

    it('must report an error when mixing integer and floating point arithmetic', () => {
        expect(interpret("((+ 1.1) 2)")).toContain("error");
    });

    it('must report an error when applying functions to incompatible types', () => {
        expect(interpret("((&& 1) true)")).toContain("error");
        expect(interpret("((+ 1) true)")).toContain("error");
        expect(interpret("((+ 1) +)")).toContain("error");
    });
});
