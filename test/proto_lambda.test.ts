import { describe, it, expect } from 'vitest'
import { Constant, Identifier, Reference, Lambda, Let, Call, Node, AST, Environment, evaluate, make_env } from '../proto/lambda'

describe('must evaluate basic expressions', () => {
    it('constant value', () => {
        const ast: AST = [
            { id: 0, kind: 'Constant', value: 42}
        ];
        expect(evaluate(ast[0], ast, make_env(), [])).toStrictEqual(42);
    });

    it('constant function', () => {
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
