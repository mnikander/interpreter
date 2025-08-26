import { describe, it, expect } from 'vitest'
import { Constant, Identifier, Reference, Lambda, Let, Call, Node, AST, Environment, evaluate, make_env } from '../proto/lambda'

describe('must evaluate basic expressions', () => {
    // 42
    it('constant value', () => {
        const ast: AST = [
            { id: 0, kind: 'Constant', value: 42}
        ];
        expect(evaluate(ast[0], ast, make_env(), [])).toStrictEqual(42);
    });

    it('constant function', () => {
        // ((lambda x 42) 1)
        const ast: AST = [
            {id: 0, kind: 'Call', body: {id: 1}, args: {id: 4}},
            {id: 1, kind: 'Lambda', binding: {id: 2}, body: {id: 3}},
            {id: 2, kind: 'Identifier', name: 'x'},
            {id: 3, kind: 'Constant', value: 42},
            {id: 4, kind: 'Constant', value: 1}
        ];
        let env = make_env();
        expect(evaluate(ast[0], ast, env,[])).toStrictEqual(42);
    });

    it('identity function', () => {
        // ((lambda x x) 1)
        const ast: AST = [
            {id: 0, kind: 'Call', body: {id: 1}, args: {id: 4}},
            {id: 1, kind: 'Lambda', binding: {id: 2}, body: {id: 3}},
            {id: 2, kind: 'Identifier', name: 'x'},
            {id: 3, kind: 'Reference', target: {id: 2}},
            {id: 4, kind: 'Constant', value: 1}
        ];
        let env = make_env();
        expect(evaluate(ast[0], ast, env, [])).toStrictEqual(1);
    });
});

describe('must evaluate nested lambda expressions', () => {
    it('first', () => {
        // (((lambda a (lambda b a)) 2) 1)
        const ast: AST = [
            {id: 0, kind: 'Call', body: {id: 1}, args: {id: 8}},
            {id: 1, kind: 'Call', body: {id: 2}, args: {id: 7}},
            {id: 2, kind: 'Lambda', binding: {id: 3}, body: {id: 4}},
            {id: 3, kind: 'Identifier', name: 'a'},
            {id: 4, kind: 'Lambda', binding: {id: 5}, body: {id: 6}},
            {id: 5, kind: 'Identifier', name: 'b'},
            {id: 6, kind: 'Reference', target: {id: 3}},
            {id: 7, kind: 'Constant', value: 2},
            {id: 8, kind: 'Constant', value: 1}
        ];
        let env = make_env();
        expect(evaluate(ast[0], ast, env, [])).toStrictEqual(1);
    });

    it('second', () => {
        // (((lambda a (lambda b b)) 2) 1)
        const ast: AST = [
            {id: 0, kind: 'Call', body: {id: 1}, args: {id: 8}},
            {id: 1, kind: 'Call', body: {id: 2}, args: {id: 7}},
            {id: 2, kind: 'Lambda', binding: {id: 3}, body: {id: 4}},
            {id: 3, kind: 'Identifier', name: 'a'},
            {id: 4, kind: 'Lambda', binding: {id: 5}, body: {id: 6}},
            {id: 5, kind: 'Identifier', name: 'b'},
            {id: 6, kind: 'Reference', target: {id: 5}},
            {id: 7, kind: 'Constant', value: 2},
            {id: 8, kind: 'Constant', value: 1}
        ];
        let env = make_env();
        expect(evaluate(ast[0], ast, env, [])).toStrictEqual(2);
    });
});

describe('must evaluate let-bindings', () => {
    it('constant value', () => {
        // (let x x 42)
        const ast: AST = [
            {id: 0, kind: 'Let', binding: {id: 1}, value: {id: 2}, body: {id: 3}},
            {id: 1, kind: 'Identifier', name: 'x'},
            {id: 2, kind: 'Constant', value: 42},
            {id: 3, kind: 'Reference', target: {id: 1}},
        ];
        let env = make_env();
        expect(evaluate(ast[0], ast, env, [])).toStrictEqual(42);
    });
});

describe('must evaluate arithmetic expressions', () => {
    it('plus with support for partial application', () => {
        // ((+ 2) 1)
        const ast: AST = [
            {id: 0, kind: 'Call', body: {id: 1}, args: {id: 4}},
            {id: 1, kind: 'Call', body: {id: 2}, args: {id: 3}},
            {id: 2, kind: 'Plus'},
            {id: 3, kind: 'Constant', value: 2},
            {id: 4, kind: 'Constant', value: 1},
        ];
        let env = make_env();
        expect(evaluate(ast[0], ast, env, [])).toStrictEqual(3);
    });

    it('lambda which uses plus', () => {
        // (( (lambda a (lambda b ((+ a) b))) 2)1)
        const ast: AST = [
            {id:  0, kind: 'Call', body: {id: 1}, args: {id: 12}},
            {id:  1, kind: 'Call', body: {id: 2}, args: {id: 11}},
            {id:  2, kind: 'Lambda', binding: {id: 3}, body: {id: 4}},
            {id:  3, kind: 'Identifier', name: 'a'},
            {id:  4, kind: 'Lambda', binding: {id: 5}, body: {id: 6}},
            {id:  5, kind: 'Identifier', name: 'b'},
            {id:  6, kind: 'Call', body: {id: 7}, args: {id: 10}},
            {id:  7, kind: 'Call', body: {id: 8}, args: {id: 9}},
            {id:  8, kind: 'Plus'},
            {id:  9, kind: 'Reference', target: {id: 3}},
            {id: 10, kind: 'Reference', target: {id: 5}},
            {id: 11, kind: 'Constant', value: 2},
            {id: 12, kind: 'Constant', value: 1}
        ];
        let env = make_env();
        expect(evaluate(ast[0], ast, env, [])).toStrictEqual(3);
    });
});
