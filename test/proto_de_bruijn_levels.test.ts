import { describe, it, expect } from 'vitest'
import { debruijn } from '../proto/de_bruijn_levels'

describe('must convert binding names to de Bruijn levels', () => {
    it('must substitute bound variables in a lambda function', () => {
        expect(debruijn( ['lambda', 'a', 42]                  )).toStrictEqual(['lambda', 42]);
        expect(debruijn( ['lambda', 'a', 'a']                 )).toStrictEqual(['lambda', { level: 0 }]);
        expect(debruijn( ['lambda', 'a', ['lambda', 'b', 'a']])).toStrictEqual(['lambda', ['lambda', { level: 0 }]]);
    });
});
