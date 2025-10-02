import { describe, it, expect } from 'vitest'
import { lex, Lexeme, Token } from '../src/lexer'

type OkLex = { ok: true, value: readonly Token[] };

describe('individual tokens', () => {

    it('must tokenize "(" to open parenthesis', () => {
        const tokens = lex('(');
        expect(tokens.length).toBe(2);
        expect(tokens[0].lexeme).toBe("OPEN");
        expect(tokens[1].lexeme).toBe("EOF");
    });

    it('must tokenize ")" to close parenthesis', () => {
        const tokens = lex(')');
        expect(tokens.length).toBe(2);
        expect(tokens[0].lexeme).toBe("CLOSE");
        expect(tokens[1].lexeme).toBe("EOF");
    });

    it('must tokenize "true" to a boolean', () => {
        const tokens = lex('true');
        expect(tokens.length).toBe(2);
        expect(tokens[0].lexeme).toBe("BOOLEAN");
        expect(tokens[0].value).toBe(true);
        expect(tokens[1].lexeme).toBe("EOF");
    });

    it('must tokenize "false" to a boolean', () => {
        const tokens = lex('false');
        expect(tokens.length).toBe(2);
        expect(tokens[0].lexeme).toBe("BOOLEAN");
        expect(tokens[0].value).toBe(false);
        expect(tokens[1].lexeme).toBe("EOF");
    });

    it('must tokenize "1" to a number', () => {
        const tokens = lex('1');
        expect(tokens.length).toBe(2);
        expect(tokens[0].lexeme).toBe("NUMBER");
        expect(tokens[0].value).toBe(1);
        expect(tokens[1].lexeme).toBe("EOF");
    });

    it('must tokenize "+1" to a number', () => {
        const tokens = lex('+1');
        expect(tokens.length).toBe(2);
        expect(tokens[0].lexeme).toBe("NUMBER");
        expect(tokens[0].value).toBe(1);
        expect(tokens[1].lexeme).toBe("EOF");
    });

    it('must tokenize "-1" to a number', () => {
        const tokens = lex('-1');
        expect(tokens.length).toBe(2);
        expect(tokens[0].lexeme).toBe("NUMBER");
        expect(tokens[0].value).toBe(-1);
        expect(tokens[1].lexeme).toBe("EOF");
    });

    it('must tokenize "-0.1" to a number', () => {
        const tokens = lex('-0.1');
        expect(tokens.length).toBe(2);
        expect(tokens[0].lexeme).toBe("NUMBER");
        expect(tokens[0].value).toBe(-0.1);
        expect(tokens[1].lexeme).toBe("EOF");
    });

    it('must tokenize a keyword token', () => {
        const tokens = lex('lambda');
        expect(tokens.length).toBe(2);
        expect(tokens[0].lexeme).toBe("LAMBDA");
        expect(tokens[1].lexeme).toBe("EOF");
    });

    it('must tokenize single letter names to an identifier', () => {
        const tokens = lex('x');
        expect(tokens.length).toBe(2);
        expect(tokens[0].lexeme).toBe("IDENTIFIER");
        expect(tokens[0].value).toBe('x');
        expect(tokens[1].lexeme).toBe("EOF");
    });

    it('must tokenize multi-letter names to an identifier', () => {
        const tokens = lex('foo');
        expect(tokens.length).toBe(2);
        expect(tokens[0].lexeme).toBe("IDENTIFIER");
        expect(tokens[0].value).toBe('foo');
        expect(tokens[1].lexeme).toBe("EOF");
    });

    it('must tokenize "+" to an identifier', () => {
        const tokens = lex('+');
        expect(tokens.length).toBe(2);
        expect(tokens[0].lexeme).toBe("IDENTIFIER");
        expect(tokens[0].value).toBe('+');
        expect(tokens[1].lexeme).toBe("EOF");
    });

    it('must convert a sequence of special characters into an identifier token', () => {
        const tokens = lex('???');
        expect(tokens.length).toBe(2);
        expect(tokens[0].lexeme).toBe("IDENTIFIER");
        expect(tokens[0].value).toBe('???');
        expect(tokens[1].lexeme).toBe("EOF");
    });

    it('must tokenize "hello world" to a string', () => {
        const tokens = lex('"hello world"');
        expect(tokens.length).toBe(2);
        expect(tokens[0].lexeme).toBe("STRING");
        expect(tokens[0].value).toBe('\"hello world\"');
        expect(tokens[1].lexeme).toBe("EOF");
    });

    it("must tokenize 'hello world' to a string", () => {
        const tokens = lex("'hello world'");
        expect(tokens.length).toBe(2);
        expect(tokens[0].lexeme).toBe("STRING");
        expect(tokens[0].value).toBe('\'hello world\'');
        expect(tokens[1].lexeme).toBe("EOF");
    });
});

describe('tokenize expressions', () => {

    it('must tokenize integer arithmetic expressions', () => {
        const tokens = lex('(+ 1 2)');
        expect(tokens.length).toBe(8);
        expect(tokens[0].lexeme).toBe("OPEN");
        expect(tokens[1].lexeme).toBe("IDENTIFIER");
        expect(tokens[2].lexeme).toBe("WHITESPACE");
        expect(tokens[3].lexeme).toBe("NUMBER");
        expect(tokens[4].lexeme).toBe("WHITESPACE");
        expect(tokens[5].lexeme).toBe("NUMBER");
        expect(tokens[6].lexeme).toBe("CLOSE");
        expect(tokens[7].lexeme).toBe("EOF");
    });

    it('must tokenize left-nested integer arithmetic expressions', () => {
        const tokens = lex('(+ (* 1 2) 3)');
        expect(tokens.length).toBe(14);
        expect(tokens[0].lexeme).toBe("OPEN");
        expect(tokens[1].lexeme).toBe("IDENTIFIER");
        expect(tokens[2].lexeme).toBe("WHITESPACE");
        expect(tokens[3].lexeme).toBe("OPEN");
        expect(tokens[4].lexeme).toBe("IDENTIFIER");
        expect(tokens[5].lexeme).toBe("WHITESPACE");
        expect(tokens[6].lexeme).toBe("NUMBER");
        expect(tokens[7].lexeme).toBe("WHITESPACE");
        expect(tokens[8].lexeme).toBe("NUMBER");
        expect(tokens[9].lexeme).toBe("CLOSE");
        expect(tokens[10].lexeme).toBe("WHITESPACE");
        expect(tokens[11].lexeme).toBe("NUMBER");
        expect(tokens[12].lexeme).toBe("CLOSE");
        expect(tokens[13].lexeme).toBe("EOF");
    });

    it('must tokenize right-nested integer arithmetic expressions', () => {
        const tokens = lex('(+ 1 (* 2 3))');
        expect(tokens.length).toBe(14);
        expect(tokens[0].lexeme).toBe("OPEN");
        expect(tokens[1].lexeme).toBe("IDENTIFIER");
        expect(tokens[2].lexeme).toBe("WHITESPACE");
        expect(tokens[3].lexeme).toBe("NUMBER");
        expect(tokens[4].lexeme).toBe("WHITESPACE");
        expect(tokens[5].lexeme).toBe("OPEN");
        expect(tokens[6].lexeme).toBe("IDENTIFIER");
        expect(tokens[7].lexeme).toBe("WHITESPACE");
        expect(tokens[8].lexeme).toBe("NUMBER");
        expect(tokens[9].lexeme).toBe("WHITESPACE");
        expect(tokens[10].lexeme).toBe("NUMBER");
        expect(tokens[11].lexeme).toBe("CLOSE");
        expect(tokens[12].lexeme).toBe("CLOSE");
        expect(tokens[13].lexeme).toBe("EOF");
    });
});
