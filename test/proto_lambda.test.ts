import { describe, it, expect } from 'vitest'
import { Value, Identifier, Reference, Lambda, Let, Call, Expression, Environment, evaluate } from '../proto/lambda'

describe('must evaluate basic expressions', () => {
    it('constant value', () => {
        const expr: Value = [   
                                {kind: 'Value', id: 0},
                                42
                            ];
        expect(evaluate(expr)).toStrictEqual(42);
    });

    it.skip('constant function', () => {
        const expr: Call =  [   
                                {kind: 'Call', id: 0},
                                [
                                    {kind: 'Lambda', id: 1},
                                    'lambda',
                                    [{kind: 'Identifier', id: 2}, 'x'],
                                    [{kind: 'Value', id: 3}, 42]
                                ],
                                [{kind: 'Value', id: 4}, 1]
                            ];
        expect(evaluate(expr)).toStrictEqual(42);
    });

    it.skip('identity function', () => {
        const expr: Call =  [
                                {kind: 'Call', id: 0},
                                [
                                    {kind: 'Lambda', id: 1},
                                    'lambda',
                                    [{kind: 'Identifier', id: 2}, 'x'],
                                    [{kind: 'Reference', id: 3}, {target: 2}]
                                ],
                                [{kind: 'Value', id: 4}, 1]
                            ];
        expect(evaluate(expr)).toStrictEqual(1);
    });
});
