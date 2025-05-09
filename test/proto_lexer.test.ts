import { describe, it, expect } from 'vitest'
import { lex } from '../proto/lexer'
import { is_error, is_ok } from '../proto/error';
import { is_token } from '../proto/token';

describe('tokenize boolean', () => {

    it('must tokenize "true" to a boolean', () => {
        const result = lex('true');
        expect(is_ok(result)).toBe(true);
        if (is_ok(result)) {
            expect(result.value.length).toBe(1);
            expect(is_token.boolean(result.value[0])).toBe(true);
            expect(result.value[0].value).toBe(true);
        }
    });

    it('must tokenize "false" to a boolean', () => {
        const result = lex('false');
        expect(is_ok(result)).toBe(true);
        if (is_ok(result)) {
            expect(result.value.length).toBe(1);
            expect(is_token.boolean(result.value[0])).toBe(true);
            expect(result.value[0].value).toBe(false);
        }
    });
});

describe('tokenize expressions', () => {

    it('must tokenize integer expressions', () => {
        const result = lex('(+ 1 2)');
        expect(is_ok(result)).toBe(true);
        if (is_ok(result)) {
            expect(result.value.length).toBe(7);
            expect(is_token.open      (result.value[0])).toBe(true);
            expect(is_token.identifier(result.value[1])).toBe(true);
            expect(is_token.whitespace(result.value[2])).toBe(true);
            expect(is_token.number    (result.value[3])).toBe(true);
            expect(is_token.whitespace(result.value[4])).toBe(true);
            expect(is_token.number    (result.value[5])).toBe(true);
            expect(is_token.close     (result.value[6])).toBe(true);
        }
    });

    it('must tokenize left-nested integer expressions', () => {
        let result = lex('(+ (* 1 2) 3)');
        expect(is_ok(result)).toBe(true);
        if (is_ok(result)) {
            expect(result.value.length).toBe(13);
            expect(is_token.open      (result.value[0])).toBe(true);
            expect(is_token.identifier(result.value[1])).toBe(true);
            expect(is_token.whitespace(result.value[2])).toBe(true);
            expect(is_token.open      (result.value[3])).toBe(true);
            expect(is_token.identifier(result.value[4])).toBe(true);
            expect(is_token.whitespace(result.value[5])).toBe(true);
            expect(is_token.number    (result.value[6])).toBe(true);
            expect(is_token.whitespace(result.value[7])).toBe(true);
            expect(is_token.number    (result.value[8])).toBe(true);
            expect(is_token.close     (result.value[9])).toBe(true);
            expect(is_token.whitespace(result.value[10])).toBe(true);
            expect(is_token.number    (result.value[11])).toBe(true);
            expect(is_token.close     (result.value[12])).toBe(true);
        }
    });

    it('must tokenize right-nested integer expressions', () => {
        const result = lex('(+ 1 (* 2 3))');
        expect(is_ok(result)).toBe(true);
        if (is_ok(result)) {
            expect(result.value.length).toBe(13);
            expect(is_token.open      (result.value[0])).toBe(true);
            expect(is_token.identifier(result.value[1])).toBe(true);
            expect(is_token.whitespace(result.value[2])).toBe(true);
            expect(is_token.number    (result.value[3])).toBe(true);
            expect(is_token.whitespace(result.value[4])).toBe(true);
            expect(is_token.open      (result.value[5])).toBe(true);
            expect(is_token.identifier(result.value[6])).toBe(true);
            expect(is_token.whitespace(result.value[7])).toBe(true);
            expect(is_token.number    (result.value[8])).toBe(true);
            expect(is_token.whitespace(result.value[9])).toBe(true);
            expect(is_token.number    (result.value[10])).toBe(true);
            expect(is_token.close     (result.value[11])).toBe(true);
            expect(is_token.close     (result.value[12])).toBe(true);
        }
    });
});
