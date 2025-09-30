import { describe, it, expect } from 'vitest'
import { add_whitespace_to_parentheses, check_whitespace } from '../src/whitespace'
import { lex } from '../src/lexer';


describe('check whitespace for correctness', () => {

    it('must report missing spaces between arguments', () => {
        expect(() => check_whitespace(add_whitespace_to_parentheses(lex('(+ 1)2)')))).toThrow();
    });

    it('must report missing spaces between parenthesized arguments', () => {
        expect(() => check_whitespace(add_whitespace_to_parentheses(lex('(+ 1)(~ 2)')))).toThrow();
    });

    it('must allow valid spacing between arguments', () => {
        expect(check_whitespace(add_whitespace_to_parentheses(lex('(+ 1) 2)')))).toBe(true);
    });

    it('must allow extra spacing between arguments', () => {
        expect(check_whitespace(add_whitespace_to_parentheses(lex('(+ 1)  2)')))).toBe(true);
    });

    it('must allow valid spacing between parenthesized arguments', () => {
        expect(check_whitespace(add_whitespace_to_parentheses(lex('(+ 1) (~ 2))')))).toBe(true);
    });

    it('must allow extra spacing between parenthesized arguments', () => {
        expect(check_whitespace(add_whitespace_to_parentheses(lex('(+ 1)  (~ 2))')))).toBe(true);
    });
});
