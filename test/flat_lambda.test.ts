import { describe, it, expect } from 'vitest'
import { Environment, evaluate, make_env } from '../src/flat/lambda'
import { Id, Flat_Literal, Flat_Identifier, Flat_Reference, Flat_Lambda, Flat_Let, Flat_Call, Flat_Plus,  Flat_Minus, Flat_Expression, Flat_Atom, Flat_AST, is_literal, is_identifier, is_reference, is_lambda, is_let, is_call, is_plus, is_minus } from "../src/flat/flat_ast";


describe('must evaluate basic expressions', () => {
    // 42
    it('constant value', () => {
        const ast: Flat_AST = [
            { id: 0, kind: 'Flat_Literal', value: 42}
        ];
        expect(evaluate(ast[0], ast, make_env(), [])).toStrictEqual(42);
    });

    it('constant function', () => {
        // ((lambda x 42) 1)
        const ast: Flat_AST = [
            {id: 0, kind: 'Flat_Call', body: {id: 1}, arg: {id: 4}},
            {id: 1, kind: 'Flat_Lambda', binding: {id: 2}, body: {id: 3}},
            {id: 2, kind: 'Flat_Identifier', name: 'x'},
            {id: 3, kind: 'Flat_Literal', value: 42},
            {id: 4, kind: 'Flat_Literal', value: 1}
        ];
        let env = make_env();
        expect(evaluate(ast[0], ast, env,[])).toStrictEqual(42);
    });

    it('identity function', () => {
        // ((lambda x x) 1)
        const ast: Flat_AST = [
            {id: 0, kind: 'Flat_Call', body: {id: 1}, arg: {id: 4}},
            {id: 1, kind: 'Flat_Lambda', binding: {id: 2}, body: {id: 3}},
            {id: 2, kind: 'Flat_Identifier', name: 'x'},
            {id: 3, kind: 'Flat_Reference', target: {id: 2}},
            {id: 4, kind: 'Flat_Literal', value: 1}
        ];
        let env = make_env();
        expect(evaluate(ast[0], ast, env, [])).toStrictEqual(1);
    });
});

describe('must evaluate nested lambda expressions', () => {
    it('first', () => {
        // ((a, b -> a) 1 2)
        // (((lambda a (lambda b a)) 1) 2)
        const ast: Flat_AST = [
            {id: 0, kind: 'Flat_Call', body: {id: 1}, arg: {id: 8}},
            {id: 1, kind: 'Flat_Call', body: {id: 2}, arg: {id: 7}},
            {id: 2, kind: 'Flat_Lambda', binding: {id: 3}, body: {id: 4}},
            {id: 3, kind: 'Flat_Identifier', name: 'a'},
            {id: 4, kind: 'Flat_Lambda', binding: {id: 5}, body: {id: 6}},
            {id: 5, kind: 'Flat_Identifier', name: 'b'},
            {id: 6, kind: 'Flat_Reference', target: {id: 3}},
            {id: 7, kind: 'Flat_Literal', value: 1},
            {id: 8, kind: 'Flat_Literal', value: 2}
        ];
        let env = make_env();
        expect(evaluate(ast[0], ast, env, [])).toStrictEqual(1);
    });

    it('second', () => {
        // ((a, b -> b) 1 2)
        // (((lambda a (lambda b b)) 1) 2)
        const ast: Flat_AST = [
            {id: 0, kind: 'Flat_Call', body: {id: 1}, arg: {id: 8}},
            {id: 1, kind: 'Flat_Call', body: {id: 2}, arg: {id: 7}},
            {id: 2, kind: 'Flat_Lambda', binding: {id: 3}, body: {id: 4}},
            {id: 3, kind: 'Flat_Identifier', name: 'a'},
            {id: 4, kind: 'Flat_Lambda', binding: {id: 5}, body: {id: 6}},
            {id: 5, kind: 'Flat_Identifier', name: 'b'},
            {id: 6, kind: 'Flat_Reference', target: {id: 5}},
            {id: 7, kind: 'Flat_Literal', value: 1},
            {id: 8, kind: 'Flat_Literal', value: 2}
        ];
        let env = make_env();
        expect(evaluate(ast[0], ast, env, [])).toStrictEqual(2);
    });
});

describe('must evaluate let-bindings', () => {
    it('constant value', () => {
        // (let x 42 x)
        const ast: Flat_AST = [
            {id: 0, kind: 'Flat_Let', binding: {id: 1}, value: {id: 2}, body: {id: 3}},
            {id: 1, kind: 'Flat_Identifier', name: 'x'},
            {id: 2, kind: 'Flat_Literal', value: 42},
            {id: 3, kind: 'Flat_Reference', target: {id: 1}},
        ];
        let env = make_env();
        expect(evaluate(ast[0], ast, env, [])).toStrictEqual(42);
    });
});

describe('must evaluate arithmetic expressions', () => {
    it('addition via partial application', () => {
        // 1 + 2
        // ((+ 1) 2)
        const ast: Flat_AST = [
            {id: 0, kind: 'Flat_Call', body: {id: 1}, arg: {id: 4}},
            {id: 1, kind: 'Flat_Call', body: {id: 2}, arg: {id: 3}},
            {id: 2, kind: 'Flat_Plus'},
            {id: 3, kind: 'Flat_Literal', value: 1},
            {id: 4, kind: 'Flat_Literal', value: 2},
        ];
        let env = make_env();
        expect(evaluate(ast[0], ast, env, [])).toStrictEqual(3);
    });

    it('nested addition', () => {
        // ((+ 1) ((+ 2) 3))
        const ast: Flat_AST = [
            {id: 0, kind: 'Flat_Call', body: {id: 1}, arg: {id: 4}},
            {id: 1, kind: 'Flat_Call', body: {id: 2}, arg: {id: 3}},
            {id: 2, kind: 'Flat_Plus'},
            {id: 3, kind: 'Flat_Literal', value: 1},
            {id: 4, kind: 'Flat_Call', body: {id: 5}, arg: {id: 8}},
            {id: 5, kind: 'Flat_Call', body: {id: 6}, arg: {id: 7}},
            {id: 6, kind: 'Flat_Plus'},
            {id: 7, kind: 'Flat_Literal', value: 2},
            {id: 8, kind: 'Flat_Literal', value: 3},
        ];
        let env = make_env();
        expect(evaluate(ast[0], ast, env, [])).toStrictEqual(6);
    });

    it('lambda which uses plus', () => {
        // (( (lambda a (lambda b ((+ a) b))) 1)2)
        const ast: Flat_AST = [
            {id:  0, kind: 'Flat_Call', body: {id: 1}, arg: {id: 12}},
            {id:  1, kind: 'Flat_Call', body: {id: 2}, arg: {id: 11}},
            {id:  2, kind: 'Flat_Lambda', binding: {id: 3}, body: {id: 4}},
            {id:  3, kind: 'Flat_Identifier', name: 'a'},
            {id:  4, kind: 'Flat_Lambda', binding: {id: 5}, body: {id: 6}},
            {id:  5, kind: 'Flat_Identifier', name: 'b'},
            {id:  6, kind: 'Flat_Call', body: {id: 7}, arg: {id: 10}},
            {id:  7, kind: 'Flat_Call', body: {id: 8}, arg: {id: 9}},
            {id:  8, kind: 'Flat_Plus'},
            {id:  9, kind: 'Flat_Reference', target: {id: 3}},
            {id: 10, kind: 'Flat_Reference', target: {id: 5}},
            {id: 11, kind: 'Flat_Literal', value: 1},
            {id: 12, kind: 'Flat_Literal', value: 2}
        ];
        let env = make_env();
        expect(evaluate(ast[0], ast, env, [])).toStrictEqual(3);
    });

    it('subtraction via partial application', () => {
        // 3 - 1
        // ((- 3) 1)
        const ast: Flat_AST = [
            {id: 0, kind: 'Flat_Call', body: {id: 1}, arg: {id: 4}},
            {id: 1, kind: 'Flat_Call', body: {id: 2}, arg: {id: 3}},
            {id: 2, kind: 'Flat_Minus'},
            {id: 3, kind: 'Flat_Literal', value: 3},
            {id: 4, kind: 'Flat_Literal', value: 1},
        ];
        let env = make_env();
        expect(evaluate(ast[0], ast, env, [])).toStrictEqual(2);
    });
});
