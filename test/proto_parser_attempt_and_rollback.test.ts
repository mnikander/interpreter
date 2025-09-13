import { describe, it, expect } from 'vitest'
import { lex } from '../src/lexer'
import { Result, is_ok, is_error } from '../src/error';
import { Nested_Expression, parse } from '../proto/parser_attempt_and_rollback';
import { Token } from '../src/token';

type OkLex   = { ok: true, value: readonly Token[] };
type OkParse = { ok: true, value: [number, Nested_Expression] };

describe('parse atoms', () => {

    it('must parse "true" to a boolean', () => {
        const parsed = parse(lex('true'));
        expect(is_ok(parsed)).toBe(true);
    
        expect(parsed.value[1].kind).toBe("Nested_Boolean");
        expect(parsed.value[1].value).toBe(true);
    });

    it('must parse "-0.1" to a number', () => {
        const parsed = parse(lex('-0.1'));
        expect(is_ok(parsed)).toBe(true);
        expect(parsed.value[1].kind).toBe("Nested_Number");
        expect(parsed.value[1].value).toEqual(-0.1);
    });

    it.skip('must parse "hello world" to a string', () => {
        const parsed = parse(lex("'hello world'"));
        expect(is_ok(parsed)).toBe(true);
        expect(parsed.value[1].kind).toBe("Nested_String");
        expect(parsed.value[1].value).toEqual("hello world");
    });

    it('must parse "+" to an identifier', () => {
        const parsed = parse(lex("+"));
        expect(is_ok(parsed)).toBe(true);
        expect(parsed.value[1].kind).toBe("Nested_Identifier");
        expect(parsed.value[1].name).toEqual("+");
    });
});

describe('valid and invalid parentheses', () => {

    it('must report an error for "("', () => {
        const parsed = parse(lex("("));
        expect(is_ok(parsed)).toBe(false);
    });

    it('must report an error for ")"', () => {
        let parsed = parse(lex(")"));
        expect(is_ok(parsed)).toBe(false);
    });

    it('must report an error for ")("', () => {
        let parsed = parse(lex(")("));
        expect(is_ok(parsed)).toBe(false);
    });

    it('must report an error for "(("', () => {
        let parsed = parse(lex("(("));
        expect(is_ok(parsed)).toBe(false);
    });

    it('must report an error for "))"', () => {
        let parsed = parse(lex("))"));
        expect(is_ok(parsed)).toBe(false);
    });

    it('must report an error for "()"', () => {
        // this check could also be done during semantic analysis, but failing fast is probably good
        let parsed = parse(lex(")("));
        expect(is_ok(parsed)).toBe(false);
    });
});

describe('expressions', () => {

    it('must report an error for empty expressions', () => {
        const parsed = parse(lex(''));
        expect(is_ok(parsed)).toBe(false);
    });

    it('must report an error for empty function calls', () => {
        // TODO: this could be delayed to the semantic analysis
        const parsed = parse(lex('()'));
        expect(is_ok(parsed)).toBe(false);
    });

    it('must report an error if the input consists of more than one expression', () => {
        const parsed = parse(lex('true false'));
        expect(is_ok(parsed)).toBe(false);
    });

    it('must report an error when spaces beween identifiers are missing', () => {
        const parsed = parse(lex('(+a b)'));
        expect(is_ok(parsed)).toBe(false);
    });

    it('must report an error for invalid identifiers, either during lexing or parsing', () => {
        expect(is_error(parse((lex('$a'))))).toBe(true);
        expect(is_error(parse((lex('a$'))))).toBe(true);
        expect(is_error(parse((lex('$1'))))).toBe(true);
        expect(is_error(parse((lex('1$'))))).toBe(true);
        expect(is_error(parse((lex('1a'))))).toBe(true);
        expect(is_error(parse((lex('1_'))))).toBe(true);
        expect(is_error(parse((lex('_+'))))).toBe(true);
    });

    it.skip('must produce a valid AST for arithmetic expressions', () => {
        let parsed = parse(lex("((+ 1) 2)"));
        expect(is_ok(parsed)).toBe(true);
        let ast: Nested_Expression = parsed.ast;
        let node_count: number     = parsed.node_count;
    });
});
