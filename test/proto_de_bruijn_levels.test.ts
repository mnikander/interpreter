import { describe, it, expect } from 'vitest'
import { AST, debruijn, evaluate } from '../proto/de_bruijn_levels'

const i_combinator: AST = ['lambda', 'x', 'x']; // identity function
const k_combinator: AST = ['lambda', 'x', ['lambda', 'y', 'x']]; // also known as 'first'
const s_combinator: AST = ['lambda', 'x', ['lambda', 'y', ['lambda', 'z', [['x', 'z'], ['y', 'z']]]]];

describe('when none of the arguments are provided, bound variable names must be substituted with de Bruijn levels', () => {
    it('constant function', () => {
        expect(debruijn( ['lambda', 'a', 42] )).toStrictEqual(['lambda', 42]);
    });

    it('I combinator', () => {
        expect(debruijn( i_combinator )).toStrictEqual(['lambda', { level: 0 }]);
    });

    it('K combinator', () => {
        expect(debruijn( k_combinator )).toStrictEqual(['lambda', ['lambda', { level: 0 }]]);
    });

    it('S combinator', () => {
        expect(debruijn( s_combinator )).toStrictEqual(['lambda', ['lambda', ['lambda', [[{ level: 0 }, { level: 2 }], [{ level: 1 }, { level: 2 }]]]]]);
    });
});

describe('when all of the arguments are provided, bound variable names must be substituted with de Bruijn levels', () => {
    it('constant function', () => {
        expect(debruijn(  [['lambda', 'a', 42], 1] )).toStrictEqual( [['lambda', 42], 1]);
    });

    it('I combinator', () => {
        expect(debruijn(  [i_combinator, 1] )).toStrictEqual( [['lambda', { level: 0 }], 1]);
    });

    it('K combinator', () => {
        expect(debruijn( [[k_combinator, 1], 2])).toStrictEqual([[['lambda', ['lambda', { level: 0 }]], 1], 2]);
    });

    it('S combinator', () => {
        // Sxyz = xz(yz)
        const x: AST = i_combinator;
        const y: AST = i_combinator;
        const z: AST = k_combinator;
        expect(debruijn( [[[s_combinator, z], y], x] )).
            toStrictEqual([[[['lambda', ['lambda', ['lambda', [[{ level: 0 }, { level: 2 }], [{ level: 1 }, { level: 2 }]]]]], z], y], x]);
    });
});

describe('when all arguments are provided, integer-valued lambda expressions must be evaluated', () => {
    it('constant function', () => {
        expect(evaluate( [['lambda', 'a', 42], -1] )).toBe(42);
        expect(evaluate( [['lambda', 'a', 42],  0] )).toBe(42);
        expect(evaluate( [['lambda', 'a', 42],  1] )).toBe(42);
        expect(evaluate( [['lambda', 'a', 42], +1] )).toBe(42);
    });

    it('I combinator', () => {
        expect(evaluate( [['lambda', 'a', 'a'], -1] )).toBe(-1);
        expect(evaluate( [['lambda', 'a', 'a'],  0] )).toBe(0);
        expect(evaluate( [['lambda', 'a', 'a'],  1] )).toBe(1);
        expect(evaluate( [['lambda', 'a', 'a'], +1] )).toBe(1);
    });

    it('K combinator', () => {
        expect(evaluate( [[['lambda', 'a', ['lambda', 'b', 'a']], 2], 1] )).toBe(1);
    });

    it('second', () => {
        expect(evaluate( [[['lambda', 'a', ['lambda', 'b', 'b']], 2], 1] )).toBe(2);
    });
});
