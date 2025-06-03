import { describe, it, expect } from 'vitest'
import { check_parentheses } from '../deprecated/parentheses'

describe('check_parentheses', () => {

    it('must reject single parentheses', () => {
        expect(check_parentheses('(')).toBe(false);
        expect(check_parentheses(')')).toBe(false);
    });

    it('must check pairs of parentheses for correctness', () => {
        expect(check_parentheses('((')).toBe(false);
        expect(check_parentheses('()')).toBe(true);
        expect(check_parentheses('))')).toBe(false);
        expect(check_parentheses(')(')).toBe(false);
    });

    it('must reject triples of parentheses', () => {
        expect(check_parentheses('(((')).toBe(false);
        expect(check_parentheses('(()')).toBe(false);
        expect(check_parentheses('()(')).toBe(false);
        expect(check_parentheses('())')).toBe(false);
        expect(check_parentheses(')((')).toBe(false);
        expect(check_parentheses(')()')).toBe(false);
        expect(check_parentheses('))(')).toBe(false);
        expect(check_parentheses(')))')).toBe(false);
    });

    it('must accept valid pairs of parentheses', () => {
        expect(check_parentheses('()()')).toBe(true);
    });

    it('must accept valid nestings of parentheses', () => {
        expect(check_parentheses('(())')).toBe(true);
        expect(check_parentheses('(()())')).toBe(true);
    });

});
