import { describe, it, expect } from 'vitest'
import { lex } from '../src/lexer'
import { is_error, is_ok, Result } from '../src/error';
import { parse, parse_nested} from '../src/parser';
import { Value, Id, Flat_Constant, Flat_Identifier, Flat_Reference, Flat_Lambda, Flat_Let, Flat_Call, Flat_Plus, Flat_Minus, Flat_Node, Flat_Atom, Flat_AST } from "./../proto/flat_ast";
import { flatten } from '../proto/flatten';

import { Token } from '../src/token';
import { AST } from '../src/ast';

type OkLex       = { ok: true, value: readonly Token[] };
type OkParse     = { ok: true, value: AST };
type NestedParse = { node_counter: number, result: Result<AST> };

describe('convert atoms', () => {

    it('must parse "true" to a boolean', () => {
        const lexed = lex('true');
        expect(is_ok(lexed)).toBe(true);
        const parsed: NestedParse = parse_nested((lexed as OkLex).value);
        expect(is_ok(parsed.result)).toBe(true);
        const ast: AST = (parsed.result as OkParse).value;
        const flat_ast: Flat_AST = flatten(ast, parsed.node_counter);

        expect(flat_ast[0].kind).toBe('Flat_Constant');
        expect(flat_ast[0].token).toBe(0);
        expect((flat_ast[0] as Flat_Constant).value).toBe(true);
    });

    it('must parse "-0.1" to a number'), () => {
        const lexed = lex('-0.1');
        expect(is_ok(lexed)).toBe(true);
        const parsed: NestedParse = parse_nested((lexed as OkLex).value);
        expect(is_ok(parsed.result)).toBe(true);
        const ast: AST = (parsed.result as OkParse).value;
        const flat_ast: Flat_AST = flatten(ast, parsed.node_counter);

        expect(flat_ast[0].kind).toBe('Flat_Constant');
        expect(flat_ast[0].token).toBe(0);
        expect((flat_ast[0] as Flat_Constant).value).toBe(-0.1);
    }
});

describe.skip('expressions', () => {
    it('must produce a valid AST for arithemetic expressions', () => {
        const lexed = lex("((+ 1) 2)");
        expect(is_ok(lexed)).toBe(true);
        const parsed: NestedParse = parse_nested((lexed as OkLex).value);
        expect(is_ok(parsed.result)).toBe(true);
        const ast: AST = (parsed.result as OkParse).value;
        const flat_ast: Flat_AST = flatten(ast, parsed.node_counter);

        expect(flat_ast.length).toBe(5);
        expect(flat_ast[0].kind).toBe('Flat_Call');
        expect((flat_ast[0] as Flat_Call).arg.id).toBe(4);

        expect(flat_ast[1].kind).toBe('Flat_Call');
        expect((flat_ast[1] as Flat_Call).arg.id).toBe(3);

        expect(flat_ast[2].kind).toBe('Flat_Identifier');
        expect((flat_ast[2] as Flat_Identifier).name).toStrictEqual('+');

        expect(flat_ast[3].kind).toBe('Flat_Constant');
        expect((flat_ast[3] as Flat_Constant).value).toBe(1);

        expect(flat_ast[4].kind).toBe('Flat_Constant');
        expect((flat_ast[4] as Flat_Constant).value).toBe(2);
    });

    it('must produce a valid AST for lambda expressions', () => {
        const lexed = lex("(((lambda a (lambda b a)) 1) 2)");
        expect(is_ok(lexed)).toBe(true);
        const parsed: NestedParse = parse_nested((lexed as OkLex).value);
        expect(is_ok(parsed.result)).toBe(true);
        const ast: AST = (parsed.result as OkParse).value;
        const flat_ast: Flat_AST = flatten(ast, parsed.node_counter);

        const expected: Flat_Node[] = [
            {id: 0, token: 0, kind: 'Flat_Call', body: {id: 1}, arg: {id: 8}},
            {id: 1, token: 1, kind: 'Flat_Call', body: {id: 2}, arg: {id: 7}},
            {id: 2, token: 2, kind: 'Flat_Lambda', binding: {id: 3}, body: {id: 4}},
            {id: 3, token: 6, kind: 'Flat_Identifier', name: 'a'},
            {id: 4, token: 8, kind: 'Flat_Lambda', binding: {id: 5}, body: {id: 6}},
            {id: 5, token: 11, kind: 'Flat_Identifier', name: 'b'},
            {id: 6, token: 13, kind: 'Flat_Reference', target: {id: 3}},
            {id: 7, token: 17, kind: 'Flat_Constant', value: 1},
            {id: 8, token: 20, kind: 'Flat_Constant', value: 2}
        ];

        expect(flat_ast.length).toBe(9);
        expect(flat_ast[0].kind).toBe('Flat_Call');
        expect((flat_ast[0] as Flat_Call).arg.id).toBe(4);

        expect(flat_ast[1].kind).toBe('Flat_Call');
        expect((flat_ast[1] as Flat_Call).arg.id).toBe(3);

        expect(flat_ast[2].kind).toBe('Flat_Lambda');
        expect(flat_ast[3].kind).toBe('Flat_Identifier');
        expect(flat_ast[4].kind).toBe('Flat_Lambda');
        expect(flat_ast[5].kind).toBe('Flat_Identifier');
        expect(flat_ast[6].kind).toBe('Flat_Reference');

        expect(flat_ast[7].kind).toBe('Flat_Constant');
        expect((flat_ast[7] as Flat_Constant).value).toBe(1);

        expect(flat_ast[8].kind).toBe('Flat_Constant');
        expect((flat_ast[8] as Flat_Constant).value).toBe(2);
    });

    it('must produce a valid AST for let-bindings', () => {
        // (let x 42 x)
        const lexed = lex("(let x x 42)");
        expect(is_ok(lexed)).toBe(true);
        const parsed: NestedParse = parse_nested((lexed as OkLex).value);
        expect(is_ok(parsed.result)).toBe(true);
        const ast: AST = (parsed.result as OkParse).value;
        const flat_ast: Flat_AST = flatten(ast, parsed.node_counter);

        const expected: Flat_Node[] = [
            {id: 0, token: 0, kind: 'Flat_Let', binding: {id: 1}, value: {id: 2}, body: {id: 3}},
            {id: 1, token: 3, kind: 'Flat_Identifier', name: 'x'},
            {id: 2, token: 5, kind: 'Flat_Constant', value: 42},
            {id: 3, token: 7, kind: 'Flat_Reference', target: {id: 1}},
        ];

        expect(flat_ast.length).toBe(4);
        expect(flat_ast[0].kind).toBe('Flat_Let');

        expect(flat_ast[1].kind).toBe('Flat_Identifier');
        expect((flat_ast[1] as Flat_Identifier).name).toBe('x');

        expect(flat_ast[2].kind).toBe('Flat_Constant');
        expect((flat_ast[2] as Flat_Constant).value).toBe('42');

        expect(flat_ast[3].kind).toBe('Flat_Reference');
        expect((flat_ast[3] as Flat_Reference).target.id).toBe(1);
    });
});
