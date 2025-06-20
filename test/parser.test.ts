import { describe, it, expect } from 'vitest'
import { lex } from '../src/lexer'
import { is_error, is_ok } from '../src/error';
import { parse } from '../src/parser';
import { Token } from '../src/token';
import { is_boolean, is_number, is_identifier, is_call } from '../src/ast';

type OkLex = { ok: true, value: readonly Token[] };

describe('parse atoms', () => {

    it('must parse "true" to a boolean', () => {
        const lexed = lex('true');
        expect(is_ok(lexed)).toBe(true);
        if (is_ok(lexed)) {
            const parsed = parse(lexed.value);
            expect(is_ok(parsed.ast)).toBe(true);
            if (is_ok(parsed.ast)) {
                let ast = parsed.ast.value;
                expect(ast).toBeDefined();
                if(ast !== undefined) {
                    expect(is_boolean(ast)).toBe(true);
                    if (is_boolean(ast)) {
                        expect(ast.kind).toBe("Boolean");
                        expect(ast.id).toBe(0);
                        expect(ast.value).toBe(true);
                    }
                }
            }
        }
    });

    it('must parse "-0.1" to a number'), () => {
        const lexed = lex('-0.1');
        expect(is_ok(lexed)).toBe(true);
        if (is_ok(lexed)) {
            const parsed = parse(lexed.value);
            expect(is_ok(parsed.ast)).toBe(true);
            if (is_ok(parsed.ast)) {
                let ast = parsed.ast.value;
                expect(ast).toBeDefined();
                if(ast !== undefined) {
                    expect(is_number(ast)).toBe(true);
                    if (is_number(ast)) {
                        expect(ast.kind).toBe("Number");
                        expect(ast.id).toBe(0);
                        expect(ast.value).toBe(-0.1);
                    }
                }
            }
        }
    }
});

describe('valid and invalid parentheses', () => {

    it('must report an error for "("', () => {
        const lexed = lex("(");
        expect(is_ok(lexed)).toBe(true);
        let parsed = parse((lexed as OkLex).value);
        expect(is_error(parsed.ast)).toBe(true);
    });

    it('must report an error for ")"', () => {
        const lexed = lex(")");
        expect(is_ok(lexed)).toBe(true);
        let parsed = parse((lexed as OkLex).value);
        expect(is_error(parsed.ast)).toBe(true);
    });

    it('must report an error for ")("', () => {
        const lexed = lex(")(");
        expect(is_ok(lexed)).toBe(true);
        let parsed = parse((lexed as OkLex).value);
        expect(is_error(parsed.ast)).toBe(true);
    });

    it('must report an error for "(("', () => {
        const lexed = lex("((");
        expect(is_ok(lexed)).toBe(true);
        let parsed = parse((lexed as OkLex).value);
        expect(is_error(parsed.ast)).toBe(true);
    });

    it('must report an error for "))"', () => {
        const lexed = lex("))");
        expect(is_ok(lexed)).toBe(true);
        let parsed = parse((lexed as OkLex).value);
        expect(is_error(parsed.ast)).toBe(true);
    });

    it('must report an error for "()"', () => {
        // this check could also be done during semantic analysis, but failing fast is probably good
        const lexed = lex(")(");
        expect(is_ok(lexed)).toBe(true);
        let parsed = parse((lexed as OkLex).value);
        expect(is_error(parsed.ast)).toBe(true);
    });
});

describe('expressions', () => {

    it('must report an error for empty expressions', () => {
        const lexed = lex('');
        if (is_error(lexed)) {
            expect(is_error(lexed)).toBe(true);
        }
        else {
            let parsed = parse(lexed.value);
            expect(is_error(parsed.ast)).toBe(true);
        }
    });

    it('must report an error for empty function calls', () => {
        // TODO: this could be delayed to the semantic analysis
        const lexed = lex('()');
        if (is_error(lexed)) {
            expect(is_error(lexed)).toBe(true);
        }
        else {
            let parsed = parse(lexed.value);
            expect(is_error(parsed.ast)).toBe(true);
        }
    });

    it('must report an error if the input consists of more than one expression', () => {
        const lexed = lex('true false');
        if (is_error(lexed)) {
            expect(is_error(lexed)).toBe(true);
        }
        else {
            let parsed = parse(lexed.value);
            expect(is_error(parsed.ast)).toBe(true);
        }
    });

    it('must report an error when spaces beween identifiers are missing', () => {
        const lexed = lex('(+a b)');
        if (is_error(lexed)) {
            expect(is_error(lexed)).toBe(true);
        }
        else {
            let parsed = parse(lexed.value);
            expect(is_error(parsed.ast)).toBe(true);
        }
    });

    it('must report an error for invalid identifiers, either during lexing or parsing', () => {
        expect(is_error(lex('$a')) || is_error(parse((lex('$a') as OkLex).value).ast)).toBe(true);
        expect(is_error(lex('a$')) || is_error(parse((lex('a$') as OkLex).value).ast)).toBe(true);
        expect(is_error(lex('$1')) || is_error(parse((lex('$1') as OkLex).value).ast)).toBe(true);
        expect(is_error(lex('1$')) || is_error(parse((lex('1$') as OkLex).value).ast)).toBe(true);
        expect(is_error(lex('1a')) || is_error(parse((lex('1a') as OkLex).value).ast)).toBe(true);
        expect(is_error(lex('1_')) || is_error(parse((lex('1_') as OkLex).value).ast)).toBe(true);
        expect(is_error(lex('_+')) || is_error(parse((lex('_+') as OkLex).value).ast)).toBe(true);
    });

    it('must produce a valid AST for arithemetic expressions', () => {
        const lexed = lex("(+ 1 2)");
        expect(is_ok(lexed)).toBe(true);
        if(is_ok(lexed)) {
            let parsed = parse(lexed.value);
            expect(is_ok(parsed.ast)).toBe(true);
            if (is_ok(parsed.ast)) {
                if(is_call(parsed.ast.value)) {
                    const ast = parsed.ast.value;
                    expect(ast.kind).toBe("Call");
                    expect(ast.data.length).toBe(3);
                    expect(is_identifier(ast.data[0])).toBe(true);
                    expect(is_number(ast.data[1])).toBe(true);
                    expect(is_number(ast.data[2])).toBe(true);
                }
            }
        }
    });
});
