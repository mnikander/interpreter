import { describe, it, expect } from 'vitest'
import { interpret } from '../src/interpret'

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
        expect(result).toContain("ERROR");
    });

    it('must report an error if the result is a function', () => {
        expect(interpret("(+ * *)")).toContain("ERROR");
    });

    it('must report an error when trying to add 3 integers in one operation', () => {
        const result = interpret("(+ 1 2 3)");
        expect(result).toContain("ERROR");
        expect(result).toContain("argument");
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
});

describe('type system', () => {
    it.skip('must report an error when implicitly converting to boolean', () => {
        expect(interpret("(! 0)")).toContain("ERROR");
        expect(interpret("(! 1)")).toContain("ERROR");
        expect(interpret("(! +)")).toContain("ERROR");
    });
});
