import { describe, it, expect } from 'vitest'
import { Value, Identifier, Reference, Lambda, Let, Call, Node, AST, Environment, evaluate } from '../proto/lambda'

describe('must evaluate basic expressions', () => {
    it('constant value', () => {
        const ast: AST = [
            { id: 0, kind: 'Value', value: 42}
        ];
        expect(evaluate(ast[0], ast)).toStrictEqual(42);
    });

    it.skip('constant function', () => {
        const ast: AST = [
            {id: 0, kind: 'Call', body: {id: 1}, args: {id: 4}},
            {id: 1, kind: 'Lambda', binding: {id: 2}, body: {id: 3}},
            {id: 2, kind: 'Identifier', name: 'x'},
            {id: 3, kind: 'Value', value: 42},
            {id: 4, kind: 'Value', value: 1}
        ];
        expect(evaluate(ast[0], ast)).toStrictEqual(42);
    });

    it.skip('identity function', () => {
        const ast: AST = [
            {id: 0, kind: 'Call', body: {id: 1}, args: {id: 4}},
            {id: 1, kind: 'Lambda', binding: {id: 2}, body: {id: 3}},
            {id: 2, kind: 'Identifier', name: 'x'},
            {id: 3, kind: 'Reference', target: {id: 2}},
            {id: 4, kind: 'Value', value: 1}
        ];
        expect(evaluate(ast[0], ast)).toStrictEqual(1);
    });
});
