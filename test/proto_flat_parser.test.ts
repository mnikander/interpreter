import { describe, it, expect } from 'vitest'
import { lex } from '../src/lexer'
import { is_error, is_ok } from '../src/error';
import { parse, Value, Id, Flat_Literal, Flat_Identifier, Flat_Reference, Flat_Lambda, Flat_Let, Flat_Call, Flat_Plus, Flat_Minus, Flat_Node, Flat_Atom, Flat_AST } from '../proto/flat_parser';

import { Token } from '../src/token';

type OkLex = { ok: true, value: readonly Token[] };

describe('parse atoms', () => {

    it('must parse "true" to a boolean', () => {
        const lexed = lex('true');
        expect(is_ok(lexed)).toBe(true);

        const ast = parse((lexed as OkLex).value);
        expect(ast[0].kind).toBe('Flat_Literal');
        expect(ast[0].token).toBe(0);
        expect((ast[0] as Flat_Literal).value).toBe(true);
    });

    it('must parse "-0.1" to a number'), () => {
        const lexed = lex('-0.1');
        expect(is_ok(lexed)).toBe(true);

        const ast = parse((lexed as OkLex).value);
        expect(ast[0].kind).toBe('Flat_Literal');
        expect(ast[0].token).toBe(0);
        expect((ast[0] as Flat_Literal).value).toBe(-0.1);
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

    it('must produce a valid AST for arithmetic expressions', () => {
        const lexed = lex("((+ 1) 2)");
        expect(is_ok(lexed)).toBe(true);
        const ast = parse((lexed as OkLex).value);

        expect(ast.length).toBe(5);
        expect(ast[0].kind).toBe('Flat_Call');
        expect((ast[0] as Flat_Call).arg.id).toBe(4);

        expect(ast[1].kind).toBe('Flat_Call');
        expect((ast[1] as Flat_Call).arg.id).toBe(3);

        expect(ast[2].kind).toBe('Flat_Identifier');
        expect((ast[2] as Flat_Identifier).name).toStrictEqual('+');

        expect(ast[3].kind).toBe('Flat_Literal');
        expect((ast[3] as Flat_Literal).value).toBe(1);

        expect(ast[4].kind).toBe('Flat_Literal');
        expect((ast[4] as Flat_Literal).value).toBe(2);
    });

    it.skip('must produce a valid AST for lambda expressions', () => {
        const lexed = lex("(((lambda a (lambda b a)) 1) 2)");
        expect(is_ok(lexed)).toBe(true);
        const ast = parse((lexed as OkLex).value);
        const expected: Flat_Node[] = [
            {id: 0, token: 0, kind: 'Flat_Call', body: {id: 1}, arg: {id: 8}},
            {id: 1, token: 1, kind: 'Flat_Call', body: {id: 2}, arg: {id: 7}},
            {id: 2, token: 2, kind: 'Flat_Lambda', binding: {id: 3}, body: {id: 4}},
            {id: 3, token: 6, kind: 'Flat_Identifier', name: 'a'},
            {id: 4, token: 8, kind: 'Flat_Lambda', binding: {id: 5}, body: {id: 6}},
            {id: 5, token: 11, kind: 'Flat_Identifier', name: 'b'},
            {id: 6, token: 13, kind: 'Flat_Reference', target: {id: 3}},
            {id: 7, token: 17, kind: 'Flat_Literal', value: 1},
            {id: 8, token: 20, kind: 'Flat_Literal', value: 2}
        ];

        expect(ast.length).toBe(9);
        expect(ast[0].kind).toBe('Flat_Call');
        expect((ast[0] as Flat_Call).arg.id).toBe(4);

        expect(ast[1].kind).toBe('Flat_Call');
        expect((ast[1] as Flat_Call).arg.id).toBe(3);

        expect(ast[2].kind).toBe('Flat_Lambda');
        expect(ast[3].kind).toBe('Flat_Identifier');
        expect(ast[4].kind).toBe('Flat_Lambda');
        expect(ast[5].kind).toBe('Flat_Identifier');
        expect(ast[6].kind).toBe('Flat_Reference');

        expect(ast[7].kind).toBe('Flat_Literal');
        expect((ast[7] as Flat_Literal).value).toBe(1);

        expect(ast[8].kind).toBe('Flat_Literal');
        expect((ast[8] as Flat_Literal).value).toBe(2);
    });

    it.skip('must produce a valid AST for let-bindings', () => {
        // (let x 42 x)
        const lexed = lex("(let x x 42)");
        expect(is_ok(lexed)).toBe(true);
        const ast = parse((lexed as OkLex).value);
        const expected: Flat_Node[] = [
            {id: 0, token: 0, kind: 'Flat_Let', binding: {id: 1}, value: {id: 2}, body: {id: 3}},
            {id: 1, token: 3, kind: 'Flat_Identifier', name: 'x'},
            {id: 2, token: 5, kind: 'Flat_Literal', value: 42},
            {id: 3, token: 7, kind: 'Flat_Reference', target: {id: 1}},
        ];

        expect(ast.length).toBe(4);
        expect(ast[0].kind).toBe('Flat_Let');

        expect(ast[1].kind).toBe('Flat_Identifier');
        expect((ast[1] as Flat_Identifier).name).toBe('x');

        expect(ast[2].kind).toBe('Flat_Literal');
        expect((ast[2] as Flat_Literal).value).toBe('42');

        expect(ast[3].kind).toBe('Flat_Reference');
        expect((ast[3] as Flat_Reference).target.id).toBe(1);
    });
});
