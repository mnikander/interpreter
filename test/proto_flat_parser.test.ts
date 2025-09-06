import { describe, it, expect } from 'vitest'
import { lex } from '../src/lexer'
import { is_error, is_ok } from '../src/error';
import { parse } from '../proto/flat_parser';
import { Call, Constant, Identifier } from '../proto/flat_ast';
import { Token } from '../src/token';

type OkLex = { ok: true, value: readonly Token[] };

describe('parse atoms', () => {

    it('must parse "true" to a boolean', () => {
        const lexed = lex('true');
        expect(is_ok(lexed)).toBe(true);

        const ast = parse((lexed as OkLex).value);
        expect(ast[0].kind).toBe('Constant');
        expect(ast[0].token).toBe(0);
        expect((ast[0] as Constant).value).toBe(true);
    });

    it('must parse "-0.1" to a number'), () => {
        const lexed = lex('-0.1');
        expect(is_ok(lexed)).toBe(true);

        const ast = parse((lexed as OkLex).value);
        expect(ast[0].kind).toBe('Constant');
        expect(ast[0].token).toBe(0);
        expect((ast[0] as Constant).value).toBe(-0.1);
    }
});

describe('valid and invalid parentheses', () => {

    it('must report an error for "("', () => {
        const lexed = lex("(");
        expect(is_ok(lexed)).toBe(true);        
        expect(() => parse((lexed as OkLex).value)).toThrow();
    });

    it('must report an error for ")"', () => {
        const lexed = lex(")");
        expect(is_ok(lexed)).toBe(true);
        expect(() => parse((lexed as OkLex).value)).toThrow();
    });

    it('must report an error for ")("', () => {
        const lexed = lex(")(");
        expect(is_ok(lexed)).toBe(true);
        expect(() => parse((lexed as OkLex).value)).toThrow();
    });

    it('must report an error for "(("', () => {
        const lexed = lex("((");
        expect(is_ok(lexed)).toBe(true);
        expect(() => parse((lexed as OkLex).value)).toThrow();
    });

    it('must report an error for "))"', () => {
        const lexed = lex("))");
        expect(is_ok(lexed)).toBe(true);
        expect(() => parse((lexed as OkLex).value)).toThrow();
    });

    it('must report an error for "()"', () => {
        // this check could also be done during semantic analysis, but failing fast is probably good
        const lexed = lex(")(");
        expect(is_ok(lexed)).toBe(true);
        expect(() => parse((lexed as OkLex).value)).toThrow();
    });
});

describe('expressions', () => {

    it('must report an error for empty expressions', () => {
        const lexed = lex('');
        if (is_error(lexed)) {
            expect(is_error(lexed)).toBe(true);
        }
        else {
            expect(() => parse(lexed.value)).toThrow();
        }
    });

    it('must report an error for empty function calls', () => {
        // TODO: this could be delayed to the semantic analysis
        const lexed = lex('()');
        if (is_error(lexed)) {
            expect(is_error(lexed)).toBe(true);
        }
        else {
            expect(() => parse(lexed.value)).toThrow();
        }
    });

    it('must report an error if the input consists of more than one expression', () => {
        const lexed = lex('true false');
        if (is_error(lexed)) {
            expect(is_error(lexed)).toBe(true);
        }
        else {
            expect(() => parse(lexed.value)).toThrow();
        }
    });

    it('must report an error when spaces beween identifiers are missing', () => {
        const lexed = lex('(+a b)');
        if (is_error(lexed)) {
            expect(is_error(lexed)).toBe(true);
        }
        else {
            expect(() => parse(lexed.value)).toThrow();
        }
    });

    it('must report an error for invalid identifiers, either during lexing or parsing', () => {
        const lexed_0 = (lex('$a')); 
        if (is_error(lexed_0)) { expect(true).toBe(true); }
        else { expect(() => parse(lexed_0.value)).toThrow(); }
        
        const lexed_1 = (lex('a$')); 
        if (is_error(lexed_1)) { expect(true).toBe(true); }
        else { expect(() => parse(lexed_1.value)).toThrow(); }
        
        const lexed_2 = (lex('$1')); 
        if (is_error(lexed_2)) { expect(true).toBe(true); }
        else { expect(() => parse(lexed_2.value)).toThrow(); }
        
        const lexed_3 = (lex('1$')); 
        if (is_error(lexed_3)) { expect(true).toBe(true); }
        else { expect(() => parse(lexed_3.value)).toThrow(); }
        
        const lexed_4 = (lex('1a')); 
        if (is_error(lexed_4)) { expect(true).toBe(true); }
        else { expect(() => parse(lexed_4.value)).toThrow(); }
        
        const lexed_5 = (lex('1_')); 
        if (is_error(lexed_5)) { expect(true).toBe(true); }
        else { expect(() => parse(lexed_5.value)).toThrow(); }
        
        const lexed_6 = (lex('_+')); 
        if (is_error(lexed_6)) { expect(true).toBe(true); }
        else { expect(() => parse(lexed_6.value)).toThrow(); }
    });

    it('must produce a valid AST for arithemetic expressions', () => {
        const lexed = lex("((+ 1) 2)");
        expect(is_ok(lexed)).toBe(true);
        const ast = parse((lexed as OkLex).value);

        expect(ast.length).toBe(5);
        expect(ast[0].kind).toBe('Call');
        expect((ast[0] as Call).arg.id).toBe(4);

        expect(ast[1].kind).toBe('Call');
        expect((ast[1] as Call).arg.id).toBe(3);

        expect(ast[2].kind).toBe('Identifier');
        expect((ast[2] as Identifier).name).toStrictEqual('+');

        expect(ast[3].kind).toBe('Constant');
        expect((ast[3] as Constant).value).toBe(1);

        expect(ast[4].kind).toBe('Constant');
        expect((ast[4] as Constant).value).toBe(2);
    });
});
