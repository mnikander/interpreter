import { describe, it, expect } from 'vitest'
import { lex, Token } from '../src/lexer'
import { parse } from '../proto/anf_parser';
import { _Expression, _Literal, _Tail, _Atomic, _Complex, _Block, _LetBind, _Lambda, _Call, _IfThenElse, _Binding, _Identifier, _Boolean, _Number, _String } from "../proto/anf_ast"
import { Flat_Expression, Flat_AST } from "../src/flat_ast";
import { flatten } from '../proto/anf_flatten';

describe('convert atoms', () => {
    it('must flatten "true" to a boolean', () => {
        const text: string       = '(true)';
        const lexed: Token[]     = lex(text);
        const parsed             = parse(lexed);
        const node_count: number = parsed.node_count;
        const flat_ast: Flat_AST = flatten(parsed.ast, parsed.node_count);

        const expected: Flat_Expression[] = [
            {id: 0, token: 0, tag: 'Flat_Block', body: {id: 1}},
            {id: 1, token: 1, tag: 'Flat_Literal', value: true},
        ];

        expect(flat_ast.length).toBe(2);
        expect(node_count).toBe(flat_ast.length);
        expect(flat_ast).toStrictEqual(expected);
    });

    it('must flatten "-0.1" to a number', () => {
        const text: string       = '(-0.1)';
        const lexed: Token[]     = lex(text);
        const parsed             = parse(lexed);
        const node_count: number = parsed.node_count;
        const flat_ast: Flat_AST = flatten(parsed.ast, parsed.node_count);

        const expected: Flat_Expression[] = [
            {id: 0, token: 0, tag: 'Flat_Block', body: {id: 1}},
            {id: 1, token: 1, tag: 'Flat_Literal', value: -0.1},
        ];
        expect(flat_ast.length).toBe(2);
        expect(node_count).toBe(flat_ast.length);
        expect(flat_ast).toStrictEqual(expected);
    });

    it('must flatten "x" to an identifier', () => {
        const text: string       = '(x)';
        const lexed: Token[]     = lex(text);
        const parsed             = parse(lexed);
        const node_count: number = parsed.node_count;
        const flat_ast: Flat_AST = flatten(parsed.ast, parsed.node_count);

        const expected: Flat_Expression[] = [
            {id: 0, token: 0, tag: 'Flat_Block', body: {id: 1}},
            {id: 1, token: 1, tag: 'Flat_Identifier', name: 'x'},
        ];
        expect(flat_ast.length).toBe(2);
        expect(node_count).toBe(flat_ast.length);
        expect(flat_ast).toStrictEqual(expected);
    });
});

describe.skip('expressions', () => {
    it('must produce a valid AST for arithmetic expressions', () => {
        const text: string       = "((+ 1) 2)";
        const lexed: Token[]     = lex(text);
        const parsed             = parse(lexed);
        const node_count: number = parsed.node_count;
        const flat_ast: Flat_AST = flatten(parsed.ast, parsed.node_count);

        const expected: Flat_Expression[] = [
            {id: 0, token: 0, tag: 'Flat_Block', body: {id: 1}},
            {id: 1, token: 1, tag: 'Flat_Call', body: {id: 2}, arg: {id: 6}},
            {id: 2, token: 1, tag: 'Flat_Block', body: {id: 3}},
            {id: 3, token: 2, tag: 'Flat_Call', body: {id: 4}, arg: {id: 5}},
            {id: 4, token: 2, tag: 'Flat_Identifier', name: '+'},
            {id: 5, token: 3, tag: 'Flat_Literal', value: 1},
            {id: 6, token: 5, tag: 'Flat_Literal', value: 2},
        ];
        
        expect(flat_ast.length).toBe(7);
        expect(node_count).toBe(flat_ast.length);
        expect(flat_ast).toStrictEqual(expected);
    });

    it('must produce a valid AST for a simple lambda expression', () => {
        const text: string       = "((lambda x (x)) 42)";
        const lexed: Token[]     = lex(text);
        const parsed             = parse(lexed);
        const node_count: number = parsed.node_count;
        const flat_ast: Flat_AST = flatten(parsed.ast, parsed.node_count);

        const expected: Flat_Expression[] = [
            {id: 0, token: 0, tag: 'Flat_Block', body: {id: 1}},
            {id: 1, token: 1, tag: 'Flat_Call', body: {id: 2}, arg: {id: 7}},
            {id: 2, token: 1, tag: 'Flat_Block', body: {id: 3}},
            {id: 3, token: 2, tag: 'Flat_Lambda', binding: {id: 4}, body: {id: 5}},
            {id: 4, token: 3, tag: 'Flat_Binding', name: 'x'},
            {id: 5, token: 4, tag: 'Flat_Block', body: {id: 6}},
            {id: 6, token: 5, tag: 'Flat_Identifier', name: 'x'},
            {id: 7, token: 8, tag: 'Flat_Literal', value: 42},
        ];
        
        expect(flat_ast.length).toBe(8);
        expect(node_count).toBe(flat_ast.length);
        expect(flat_ast).toStrictEqual(expected);
    });

    it('must produce a valid AST for lambda expressions', () => {
        const text: string       = "((lambda a (lambda b (a)) 1) 2)";
        const lexed: Token[]     = lex(text);
        const parsed             = parse(lexed);
        const node_count: number = parsed.node_count;
        const flat_ast: Flat_AST = flatten(parsed.ast, parsed.node_count);

        const expected: Flat_Expression[] = [
            {id:  0, token:  0, tag: 'Flat_Block', body: {id: 1}},
            {id:  1, token:  1, tag: 'Flat_Call', body: {id: 2}, arg: {id: 12}},
            {id:  2, token:  1, tag: 'Flat_Block', body: {id: 3}},
            {id:  3, token:  2, tag: 'Flat_Call', body: {id: 4}, arg: {id: 11}},
            {id:  4, token:  2, tag: 'Flat_Lambda', binding: {id: 3}, body: {id: 6}},
            {id:  5, token:  3, tag: 'Flat_Binding', name: 'a'},
            {id:  6, token:  4, tag: 'Flat_Block', body: {id: 7}},
            {id:  7, token:  5, tag: 'Flat_Lambda', binding: {id: 5}, body: {id: 8}},
            {id:  8, token:  6, tag: 'Flat_Binding', name: 'b'},
            {id:  9, token:  7, tag: 'Flat_Block', body: {id: 3}},
            {id: 10, token:  8, tag: 'Flat_Identifier', name: 'a'},
            {id: 11, token: 11, tag: 'Flat_Literal', value: 1},
            {id: 12, token: 13, tag: 'Flat_Literal', value: 2}
        ];

        expect(flat_ast.length).toBe(13);
        expect(node_count).toBe(flat_ast.length);
        expect(flat_ast).toStrictEqual(expected);
    });

    it('must produce a valid AST for let-bindings', () => {
        const text: string       = "(let x = 42 in x)";
        const lexed: Token[]     = lex(text);
        const parsed             = parse(lexed);
        const node_count: number = parsed.node_count;
        const flat_ast: Flat_AST = flatten(parsed.ast, parsed.node_count);

        const expected: Flat_Expression[] = [
            {id: 0, token: 0, tag: 'Flat_Block', body: {id: 1}},
            {id: 1, token: 1, tag: 'Flat_Let', binding: {id: 2}, value: {id: 3}, body: {id: 4}},
            {id: 2, token: 2, tag: 'Flat_Binding', name: 'x'},
            {id: 3, token: 4, tag: 'Flat_Literal', value: 42},
            {id: 4, token: 6, tag: 'Flat_Identifier', name: 'x'},
        ];

        expect(flat_ast.length).toBe(5);
        expect(node_count).toBe(flat_ast.length);
        expect(flat_ast).toStrictEqual(expected);
    });

    it('must produce a valid AST when let-binding to a function', () => {
        const text: string       = "(let successor (lambda x ((+ 1) x)) (successor 41))";
        const lexed: Token[]     = lex(text);
        const parsed             = parse(lexed);
        const node_count: number = parsed.node_count;
        const flat_ast: Flat_AST = flatten(parsed.ast, parsed.node_count);

        const expected: Flat_Expression[] = [
            {id:  0, token:  0, tag: 'Flat_Let', binding: {id: 1}, value: {id: 2}, body: {id: 9}},
            {id:  1, token:  2, tag: 'Flat_Binding', name: 'successor'},
            {id:  2, token:  3, tag: 'Flat_Lambda', binding: {id: 3}, body: {id: 4}},
            {id:  3, token:  5, tag: 'Flat_Binding', name: 'x'},
            {id:  4, token:  6, tag: 'Flat_Call', body: {id: 5}, arg: {id: 8}}, // 8 is large
            {id:  5, token:  7, tag: 'Flat_Call', body: {id: 6}, arg: {id: 7}},
            {id:  6, token:  8, tag: 'Flat_Identifier', name: '+'},
            {id:  7, token:  9, tag: 'Flat_Literal', value: 1},
            {id:  8, token: 11, tag: 'Flat_Identifier', name: 'x'},
            {id:  9, token: 14, tag: 'Flat_Call', body: {id: 10}, arg: {id: 11}},
            {id: 10, token: 15, tag: 'Flat_Identifier', name: 'successor'},
            {id: 11, token: 16, tag: 'Flat_Literal', value: 41},
        ];

        expect(flat_ast.length).toBe(12);
        expect(node_count).toBe(flat_ast.length);
        expect(flat_ast).toStrictEqual(expected);
    });

    it('must produce a valid AST for if-expressions', () => {
        const text: string       = "(if true (42) (0))";
        const lexed: Token[]     = lex(text);
        const parsed             = parse(lexed);
        const node_count: number = parsed.node_count;
        const flat_ast: Flat_AST = flatten(parsed.ast, parsed.node_count);

        const expected: Flat_Expression[] = [
            {id: 0, token: 0, tag: 'Flat_If', condition: {id: 1}, then_branch: {id: 2}, else_branch: {id: 3}},
            {id: 1, token: 2, tag: 'Flat_Literal', value: true},
            {id: 2, token: 3, tag: 'Flat_Literal', value: 42},
            {id: 3, token: 4, tag: 'Flat_Literal', value: 0},
        ];

        expect(flat_ast.length).toBe(4);
        expect(node_count).toBe(flat_ast.length);
        expect(flat_ast).toStrictEqual(expected);
    });
});
