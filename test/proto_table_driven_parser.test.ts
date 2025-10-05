import { describe, it, expect } from 'vitest'
import { lex, parse } from '../proto/table_driven_parser';

describe('balanced parentheses', () => {

    it('empty', () => {
        expect(parse(lex(''))).toBe(true);
    });
    it('()', () => {
        expect(parse(lex('()'))).toBe(true);
    });
    it('()()', () => {
        expect(parse(lex('()()'))).toBe(true);
    });
    it('(())', () => {
        expect(parse(lex('(())'))).toBe(true);
    });
});

describe('must reject unbalanced parentheses', () => {
    it('(', () => {
        expect(parse(lex('('))).toBe(false);
    });

    it(')', () => {
        expect(parse(lex(')'))).toBe(false);
    });

    it('((', () => {
        expect(parse(lex('(('))).toBe(false);
    });
    
    it(')(', () => {
        expect(parse(lex(')('))).toBe(false);
    });
    
    it('))', () => {
        expect(parse(lex('))'))).toBe(false);
    });

    it('(((', () => {
        expect(parse(lex('((('))).toBe(false);
    });

    it('(()', () => {
        expect(parse(lex('(()'))).toBe(false);
    });

    it('()(', () => {
        expect(parse(lex('()('))).toBe(false);
    });

    it('())', () => {
        expect(parse(lex('())'))).toBe(false);
    });

    it(')((', () => {
        expect(parse(lex(')(('))).toBe(false);
    });

    it(')()', () => {
        expect(parse(lex(')()'))).toBe(false);
    });

    it('))(', () => {
        expect(parse(lex('))('))).toBe(false);
    });

    it(')))', () => {
        expect(parse(lex(')))'))).toBe(false);
    });
});
