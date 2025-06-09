import { describe, it, expect } from 'vitest'
import { AST, debruijn, evaluate } from '../proto/de_bruijn_levels'

const i_combinator: AST = ['lambda', 'x', 'x']; // identity function
const k_combinator: AST = ['lambda', 'x', ['lambda', 'y', 'x']]; // selection function, also known as 'first'
const s_combinator: AST = ['lambda', 'x', ['lambda', 'y', ['lambda', 'z', [['x', 'z'], ['y', 'z']]]]]; // substitution function

describe('when none of the arguments are provided, bound variable names must be substituted with de Bruijn levels', () => {
    it('constant function', () => {
        expect(debruijn( ['lambda', 'x', 42] )).toStrictEqual(['lambda', 42]);
    });

    it('identity function', () => {
        expect(debruijn( ['lambda', 'x', 'x'] )).toStrictEqual(['lambda', { level: 0 }]);
    });

    it('selection function', () => {
        expect(debruijn( ['lambda', 'x', ['lambda', 'y', 'x']] )).toStrictEqual(['lambda', ['lambda', { level: 0 }]]);
    });

    it('substitution function', () => {
        expect(debruijn( s_combinator )).toStrictEqual(['lambda', ['lambda', ['lambda', [[{ level: 0 }, { level: 2 }], [{ level: 1 }, { level: 2 }]]]]]);
    });

    it('shadowing of parameter names', () => {
        expect(debruijn( ['lambda', 'x', ['lambda', 'x', 'x']] )).toStrictEqual(['lambda', ['lambda', { level: 1 }]]);
    });

    it('nested identity function', () => {
        expect(debruijn( [['lambda', 'x', 'x'], ['lambda', 'x', 'x']] )).toStrictEqual([['lambda', { level: 0 }], ['lambda', { level: 0 }]]);
    });
});

describe('when all of the arguments are provided, bound variable names must be substituted with de Bruijn levels', () => {
    it('constant function', () => {
        expect(debruijn(  [['lambda', 'a', 42], 1] )).toStrictEqual( [['lambda', 42], 1]);
    });

    it('identity function', () => {
        expect(debruijn(  [i_combinator, 1] )).toStrictEqual( [['lambda', { level: 0 }], 1]);
    });

    it('selection function', () => {
        expect(debruijn( [[k_combinator, 1], 2])).toStrictEqual([[['lambda', ['lambda', { level: 0 }]], 1], 2]);
    });

    it('substitution function', () => {
        // Sxyz = xz(yz)
        const x: AST = i_combinator;
        const y: AST = i_combinator;
        const z: AST = k_combinator;
        expect(debruijn( [[[s_combinator, z], y], x] )).
            toStrictEqual([[[['lambda', ['lambda', ['lambda', [[{ level: 0 }, { level: 2 }], [{ level: 1 }, { level: 2 }]]]]], ['lambda', ['lambda', { level: 0 }]]], ['lambda', { level: 0 }]], ['lambda', { level: 0 }]]);
    });
});

describe('when all arguments are provided, integer-valued lambda expressions must be evaluated', () => {
    it('constant function', () => {
        expect(evaluate( [['lambda', 'a', 42], -1] )).toBe(42);
        expect(evaluate( [['lambda', 'a', 42],  0] )).toBe(42);
        expect(evaluate( [['lambda', 'a', 42],  1] )).toBe(42);
        expect(evaluate( [['lambda', 'a', 42], +1] )).toBe(42);
    });

    it('identity function', () => {
        expect(evaluate( [['lambda', 'a', 'a'], -1] )).toBe(-1);
        expect(evaluate( [['lambda', 'a', 'a'],  0] )).toBe(0);
        expect(evaluate( [['lambda', 'a', 'a'],  1] )).toBe(1);
        expect(evaluate( [['lambda', 'a', 'a'], +1] )).toBe(1);
    });

    it('selection (first)', () => {
        expect(evaluate( [[['lambda', 'a', ['lambda', 'b', 'a']], 2], 1] )).toBe(1);
    });

    it('second', () => {
        expect(evaluate( [[['lambda', 'a', ['lambda', 'b', 'b']], 2], 1] )).toBe(2);
    });

    it('shadowing', () => {
        expect(evaluate( [[['lambda', 'x', ['lambda', 'x', 'x']], 2], 1])).toStrictEqual(2);
    });
});

describe('when all arguments are provided, higher-order lambda expressions must be evaluated', () => {
    it('nested identity function', () => {
        expect(evaluate( [[i_combinator, i_combinator], 42] )).toBe(42);
    });

    it('nested first and second functions', () => {
        const first : AST = ['lambda', 'a', ['lambda', 'b', 'a']];
        const second: AST = ['lambda', 'a', ['lambda', 'b', 'b']];
        expect(evaluate( [[[[first, first], second], 2], 1] )).toBe(1);
    });

    // TODO: expand these tests with further examples for higher order functions
});

describe.skip('when some of the arguments are provided, a closure must be created', () => {
    it('partial application of first', () => {
        expect(evaluate( [['lambda', 'a', ['lambda', 'b', 'a']], 2] )).toBe('a closure');
    });
});
