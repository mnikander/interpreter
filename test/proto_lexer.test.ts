import { describe, it, expect } from 'vitest'
import { lex } from '../proto/lexer'
import { is_error } from '../proto/error';
import { Token, is_token } from '../proto/token';

describe('tokenize boolean', () => {

    it('must tokenize "true" to a boolean', () => {
        const result = lex('true');
        expect(!is_error(result)).toBe(true);
        expect((result as Token[]).length).toBe(1);
        expect(is_token.boolean(result[0])).toBe(true);
        expect(result[0].value).toBe(true);
    });

    it('must tokenize "false" to a boolean', () => {
        const result = lex('false');
        expect(!is_error(result)).toBe(true);
        expect((result as Token[]).length).toBe(1);
        expect(is_token.boolean(result[0])).toBe(true);
        expect(result[0].value).toBe(false);
    });

    it('must report an error if the input consists of more than one expression', () => {
        const result = lex('true false');
        expect(is_error(result)).toBe(true);
    });
});

describe('tokenize expressions', () => {
    it('must tokenize integer expressions', () => {
        const result = lex('(+ 1 2)');
        expect(is_error(result)).toBe(false);
        expect((result as Token[]).length).toBe(5);
        expect(is_token.open(result[0])).toBe(true);
        expect(is_token.identifier(result[1])).toBe(true);
        expect(is_token.number(result[2])).toBe(true);
        expect(is_token.number(result[3])).toBe(true);
        expect(is_token.close(result[4])).toBe(true);
    });

    it('must tokenize left-nested integer expressions', () => {
        const result = lex('(+ (* 1 2) 3)');
        expect(is_error(result)).toBe(false);
        expect((result as Token[]).length).toBe(9);
        expect(is_token.open(result[0])).toBe(true);
        expect(is_token.identifier(result[1])).toBe(true);
        expect(is_token.open(result[2])).toBe(true);
        expect(is_token.identifier(result[3])).toBe(true);
        expect(is_token.number(result[4])).toBe(true);
        expect(is_token.number(result[5])).toBe(true);
        expect(is_token.close(result[6])).toBe(true);
        expect(is_token.number(result[7])).toBe(true);
        expect(is_token.close(result[8])).toBe(true);
    });

    it('must tokenize right-nested integer expressions', () => {
        const result = lex('(+ 1 (* 2 3))');
        expect(is_error(result)).toBe(false);
        expect((result as Token[]).length).toBe(9);
        expect(is_token.open(result[0])).toBe(true);
        expect(is_token.identifier(result[1])).toBe(true);
        expect(is_token.number(result[2])).toBe(true);
        expect(is_token.open(result[3])).toBe(true);
        expect(is_token.identifier(result[4])).toBe(true);
        expect(is_token.number(result[5])).toBe(true);
        expect(is_token.number(result[6])).toBe(true);
        expect(is_token.close(result[7])).toBe(true);
        expect(is_token.close(result[8])).toBe(true);
    });
});