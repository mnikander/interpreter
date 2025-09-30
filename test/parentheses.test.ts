import { describe, it, expect } from 'vitest'
import { check_parentheses } from '../src/parentheses'

describe('check parentheses for balance', () => {

    it('must reject single parentheses', () => {
        expect(() => check_parentheses('(')).toThrow();
        expect(() => check_parentheses(')')).toThrow();
    });

    it('must check pairs of parentheses for correctness', () => {
        expect(() => check_parentheses('((')).toThrow();
        expect(check_parentheses('()')).toBe(true);
        expect(() => check_parentheses('))')).toThrow();
        expect(() => check_parentheses(')(')).toThrow();
    });

    it('must reject triples of parentheses', () => {
        expect(() => check_parentheses('(((')).toThrow();
        expect(() => check_parentheses('(()')).toThrow();
        expect(() => check_parentheses('()(')).toThrow();
        expect(() => check_parentheses('())')).toThrow();
        expect(() => check_parentheses(')((')).toThrow();
        expect(() => check_parentheses(')()')).toThrow();
        expect(() => check_parentheses('))(')).toThrow();
        expect(() => check_parentheses(')))')).toThrow();
    });

    it('must accept valid pairs of parentheses', () => {
        expect(check_parentheses('()()')).toBe(true);
    });

    it('must accept valid nestings of parentheses', () => {
        expect(check_parentheses('(())')).toBe(true);
        expect(check_parentheses('(()())')).toBe(true);
    });

});
