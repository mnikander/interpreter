import { describe, it, expect } from 'vitest'
import { interpret } from '../src/interpret'

describe('help dialog', () => {
    it('must print help', () => {
        expect(interpret("(help)")).toContain("help");
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
        expect(interpret("True")).toBe(true);
        expect(interpret("False")).toBe(false);
    });
});

describe('valid input and output', () => {
    it('must report an error if the input consists of more than one expression', () => {
        const result = interpret("1 2");
        expect(result).toContain("error");
    });

    it('must report an error when calling a function with an incorrect number of arguments', () => {
        const result = interpret("(+ 1 2 3)");
        expect(result).toContain("error");
        expect(result).toContain("argument");
    });

    it('must report an error when evaluating undefined identifiers', () => {
        const result = interpret('x');
        expect(result).toContain("error");
        expect(result).toContain("identifier");
        expect(result).toContain("x");
    });

    it('must report an error when calling undefined functions', () => {
        const result = interpret('(+++ 2 3)');
        expect(result).toContain("error");
        expect(result).toContain("+++");
    });
});

describe('arithmetic and logical expressions', () => {
    it('must add two integers together', () => {
        const result = interpret("(+ 1 2)");
        expect(result).toBe(3);
    });

    it("must evaluate logical 'not' expressions", () => {
        expect(interpret("(! True)")).toBe(false);
        expect(interpret("(! False)")).toBe(true);
    });

    it("must evaluate logical 'and' expressions", () => {
        const ff = interpret("(& False False)");
        expect(ff).toBe(false);

        const ft = interpret("(& False True)");
        expect(ft).toBe(false);

        const tf = interpret("(& True False)");
        expect(tf).toBe(false);

        const tt = interpret("(& True True)");
        expect(tt).toBe(true);
    });

    it("must evaluate logical 'or' expressions", () => {
        const ff = interpret("(| False False)");
        expect(ff).toBe(false);

        const ft = interpret("(| False True)");
        expect(ft).toBe(true);

        const tf = interpret("(| True False)");
        expect(tf).toBe(true);

        const tt = interpret("(| True True)");
        expect(tt).toBe(true);
    });
});

describe('if-expression', () => {
    it('when the 1st expression is true, "if" must return the 2nd expression', () => {
        const result = interpret("(if True 4 8)");
        expect(result).toBe(4);
    });

    it('when the 1st expression is false, "if" must return the 3rd expression', () => {
        const result = interpret("(if False 4 8)");
        expect(result).toBe(8);
    });
});

describe('nested expressions', () => {
    it('must evaluate left-nested addition', () => {
        const result = interpret("(+ (+ 1 2) 3)");
        expect(result).toBe(6);
    });

    it('must evaluate right-nested addition', () => {
        const result = interpret("(+ 1 (+ 2 3))");
        expect(result).toBe(6);
    });

    it('must forward error messages from nested functions', () => {
        const result = interpret('(+ 1 (+++ 2 3))');
        expect(result).toContain("error");
        expect(result).toContain("+++");
    });

    it('must report the first error to occur from nested functions', () => {
        const result = interpret('(+++ 1 (+ 2))');
        expect(result).toContain("error");
        expect(result).toContain("+++");
    });
});

describe('let-bindings', () => {
    it('must support variable binding', () => {
        expect(interpret('(let x 42 x)')).toBe(42);
        expect(interpret('(let x True x)')).toBe(true);
    });

    it('must support variable binding inside of nested expressions', () => {
        expect(interpret('(let x 41 (+ x 1))')).toBe(42);
        expect(interpret('(let x 1 (+ x (* x 2)))')).toBe(3);
    });

    it('must support function binding', () => {
        expect(interpret('(let add + (add 1 2))')).toBe(3);
    });

    it('must report an error if the 1st argument the let-binding is not an identifier', () => {
        const result = interpret('(let 4 2 x)');
        expect(result).toContain("error");
        expect(result).toContain("identifier");
    });

    it('must report an error if the 2nd argument the let-binding contains undefined variables', () => {
        const result = interpret('(let x 2 (+ x y))');
        expect(result).toContain("error");
        expect(result).toContain("identifier");
    });

    it('must report an error if the 3rd argument the let-binding contains undefined variables', () => {
        const result = interpret('(let x 2 (+ x y))');
        expect(result).toContain("error");
        expect(result).toContain("identifier");
    });

    it('must report an error if a let-binding is provided too few arguments', () => {
        const result = interpret('(let x 42)');
        expect(result).toContain("error");
        expect(result).toContain("argument");
    });

    it('must report an error if a let-binding is provided too many arguments', () => {
        const result = interpret('(let x 2 x x)');
        expect(result).toContain("error");
        expect(result).toContain("argument");
    });
});

describe.skip('type system', () => {
    it('must report an error when implicitly converting to a boolean', () => {
        expect(interpret("(! 0)")).toContain("error");
        expect(interpret("(! 1)")).toContain("error");
        expect(interpret("(! +)")).toContain("error");
    });

    it('must report an error when implicitly converting to a string', () => {
        expect(interpret("(+ 1 (help))")).toContain("error");
        expect(interpret("(+ - -)")).toContain("error");
    });

    it('must report an error when implicitly converting to a number', () => {
        expect(interpret("(* + +)")).toContain("error");
    });

    it('must report an error when mixing integer and floating point arithmetic', () => {
        expect(interpret("(+ 1.1 2)")).toContain("error");
    });

    it('must report an error when applying functions to incompatible types', () => {
        expect(interpret("(& 1 True)")).toContain("error");
        expect(interpret("(+ 1 True)")).toContain("error");
        expect(interpret("(+ 1 +)")).toContain("error");
    });
});
