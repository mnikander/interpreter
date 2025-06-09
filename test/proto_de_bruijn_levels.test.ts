import { describe, it, expect } from 'vitest'
import { debruijn, evaluate } from '../proto/de_bruijn_levels'

describe('when none of the arguments are provided, bound variable names must be substituted with de Bruijn levels', () => {
    it('constant function', () => {
        expect(debruijn( ['lambda', 'a', 42] )).toStrictEqual(['lambda', 42]);
    });

    it('I combinator', () => {
        expect(debruijn( ['lambda', 'a', 'a'] )).toStrictEqual(['lambda', { level: 0 }]);
    });

    it('K combinator', () => {
        expect(debruijn( ['lambda', 'a', ['lambda', 'b', 'a']])).toStrictEqual(['lambda', ['lambda', { level: 0 }]]);
    });
});

describe('when all of the arguments are provided, bound variable names must be substituted with de Bruijn levels', () => {
    it('constant function', () => {
        expect(debruijn(  [['lambda', 'a', 42], 1] )).toStrictEqual( [['lambda', 42], 1]);
    });

    it('I combinator', () => {
        expect(debruijn(  [['lambda', 'a', 'a'], 1] )).toStrictEqual( [['lambda', { level: 0 }], 1]);
    });

    it('K combinator', () => {
        expect(debruijn( [[['lambda', 'a', ['lambda', 'b', 'a']], 1], 2])).toStrictEqual([[['lambda', ['lambda', { level: 0 }]], 1], 2]);
    });
});

describe('integer-valued lambda expressions', () => {
    it('must evaluate a constant expression', () => {
        expect(evaluate( [['lambda', 'a', 42], -1] )).toBe(42);
        expect(evaluate( [['lambda', 'a', 42],  0] )).toBe(42);
        expect(evaluate( [['lambda', 'a', 42],  1] )).toBe(42);
        expect(evaluate( [['lambda', 'a', 42], +1] )).toBe(42);
    });

    it('must evaluate the identity expression', () => {
        expect(evaluate( [['lambda', 'a', 'a'], -1] )).toBe(-1);
        expect(evaluate( [['lambda', 'a', 'a'],  0] )).toBe(0);
        expect(evaluate( [['lambda', 'a', 'a'],  1] )).toBe(1);
        expect(evaluate( [['lambda', 'a', 'a'], +1] )).toBe(1);
    });

    it('must evaluate a nested lambda expressions', () => {
        expect(evaluate( [[['lambda', 'a', ['lambda', 'b', 'a']], 2], 1] )).toBe(1);
        expect(evaluate( [[['lambda', 'a', ['lambda', 'b', 'b']], 2], 1] )).toBe(2);
    });
});
