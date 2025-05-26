import { describe, it, expect } from 'vitest'
import { lex } from '../proto/lexer'
import { is_error, is_ok } from '../proto/error';
import { is_token, Token } from '../proto/token';

type OkLex = { ok: true, value: readonly Token[] };

describe('individual tokens', () => {

    it('must tokenize "(" to open parenthesis', () => {
        const attempt = lex('(');
        expect(is_ok(attempt)).toBe(true);

        const result = attempt as OkLex;
        expect(result.value.length).toBe(1); // expect just one token
        expect(is_token.open(result.value[0])).toBe(true);
    });

    it('must tokenize ")" to close parenthesis', () => {
        const attempt = lex(')');
        expect(is_ok(attempt)).toBe(true);

        const result = attempt as OkLex;
        expect(result.value.length).toBe(1); // expect just one token
        expect(is_token.close(result.value[0])).toBe(true);
    });

    it('must tokenize "true" to a boolean', () => {
        const attempt = lex('true');
        expect(is_ok(attempt)).toBe(true);

        const result = attempt as OkLex;
        expect(result.value.length).toBe(1);
        expect(is_token.boolean(result.value[0])).toBe(true);
        expect(result.value[0].value).toBe(true);
    });

    it('must tokenize "false" to a boolean', () => {
        const attempt = lex('false');
        expect(is_ok(attempt)).toBe(true);

        const result = attempt as OkLex;
        expect(result.value.length).toBe(1); // expect just one token
        expect(is_token.boolean(result.value[0])).toBe(true);
        expect(result.value[0].value).toBe(false);
    });

    it('must tokenize "1" to a number', () => {
        const attempt = lex('1');
        expect(is_ok(attempt)).toBe(true);

        const result = attempt as OkLex;
        expect(result.value.length).toBe(1); // expect just one token
        expect(is_token.number(result.value[0])).toBe(true);
        expect(result.value[0].value).toBe(1);
    });

    it('must tokenize "+1" to a number', () => {
        const attempt = lex('+1');
        expect(is_ok(attempt)).toBe(true);

        const result = attempt as OkLex;
        expect(result.value.length).toBe(1); // expect just one token
        expect(is_token.number(result.value[0])).toBe(true);
        expect(result.value[0].value).toBe(1);
    });

    it('must tokenize "-1" to a number', () => {
        const attempt = lex('-1');
        expect(is_ok(attempt)).toBe(true);

        const result = attempt as OkLex;
        expect(result.value.length).toBe(1); // expect just one token
        expect(is_token.number(result.value[0])).toBe(true);
        expect(result.value[0].value).toBe(-1);
    });

    it('must tokenize "-0.1" to a number', () => {
        const attempt = lex('-0.1');
        expect(is_ok(attempt)).toBe(true);

        const result = attempt as OkLex;
        expect(result.value.length).toBe(1); // expect just one token
        expect(is_token.number(result.value[0])).toBe(true);
        expect(result.value[0].value).toBe(-0.1);
    });

    it('must tokenize single letter names to an identifier', () => {
        const attempt = lex('x');
        expect(is_ok(attempt)).toBe(true);

        const result = attempt as OkLex;
        expect(result.value.length).toBe(1); // expect just one token
        expect(is_token.identifier(result.value[0])).toBe(true);
        expect(result.value[0].value).toBe('x');
    });

    it('must tokenize multi-letter names to an identifier', () => {
        const attempt = lex('foo');
        expect(is_ok(attempt)).toBe(true);

        const result = attempt as OkLex;
        expect(result.value.length).toBe(1); // expect just one token
        expect(is_token.identifier(result.value[0])).toBe(true);
        expect(result.value[0].value).toBe('foo');
    });

    it('must tokenize "+" to an identifier', () => {
        const attempt = lex('+');
        expect(is_ok(attempt)).toBe(true);

        const result = attempt as OkLex;
        expect(result.value.length).toBe(1); // expect just one token
        expect(is_token.identifier(result.value[0])).toBe(true);
        expect(result.value[0].value).toBe('+');
    });

    it('must convert a sequence of special characters into an identifier token', () => {
        const attempt = lex('???');
        expect(is_ok(attempt)).toBe(true);

        const result = attempt as OkLex;
        expect(result.value.length).toBe(1); // expect just one token
        expect(is_token.identifier(result.value[0])).toBe(true);
        expect(result.value[0].value).toBe('???');
    });
});

describe('tokenize expressions', () => {

    it('must tokenize integer arithmetic expressions', () => {
        const attempt = lex('(+ 1 2)');
        expect(is_ok(attempt)).toBe(true);

        const result = attempt as OkLex;
        expect(result.value.length).toBe(7);
        expect(is_token.open      (result.value[0])).toBe(true);
        expect(is_token.identifier(result.value[1])).toBe(true);
        expect(is_token.whitespace(result.value[2])).toBe(true);
        expect(is_token.number    (result.value[3])).toBe(true);
        expect(is_token.whitespace(result.value[4])).toBe(true);
        expect(is_token.number    (result.value[5])).toBe(true);
        expect(is_token.close     (result.value[6])).toBe(true);
    });

    it('must tokenize left-nested integer arithmetic expressions', () => {
        const attempt = lex('(+ (* 1 2) 3)');
        expect(is_ok(attempt)).toBe(true);

        const result = attempt as OkLex;
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
    });

    it('must tokenize right-nested integer arithmetic expressions', () => {
        const attempt = lex('(+ 1 (* 2 3))');
        expect(is_ok(attempt)).toBe(true);

        const result = attempt as OkLex;
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
    });
});
