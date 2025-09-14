import { describe, it, expect } from 'vitest'
import { lex } from '../src/lexer'
import { parse } from '../src/flat/parser_oo';
import { Value, Id, Flat_Literal, Flat_Identifier, Flat_Reference, Flat_Lambda, Flat_Let, Flat_Call, Flat_Plus, Flat_Minus, Flat_Expression, Flat_Atom, Flat_AST } from "../src/flat/flat_ast";
import { flatten } from '../src/flat/flatten';

describe('convert atoms', () => {

    it('must parse "true" to a boolean', () => {
        const text: string       = 'true';
        const parsed             = parse(lex(text));
        const node_count: number = parsed.node_count;
        const flat_ast: Flat_AST = flatten(parsed.ast, parsed.node_count);

        const expected: Flat_Expression[] = [
            {id: 0, token: 0, kind: 'Flat_Literal', value: true},
        ];

        expect(node_count).toBe(1);
        expect(flat_ast.length).toBe(1);
        expect(flat_ast).toStrictEqual(expected);
    });

    it('must parse "-0.1" to a number'), () => {
        const text: string       = '-0.1';
        const parsed             = parse(lex(text));
        const node_count: number = parsed.node_count;
        const flat_ast: Flat_AST = flatten(parsed.ast, parsed.node_count);

        const expected: Flat_Expression[] = [
            {id: 0, token: 0, kind: 'Flat_Literal', value: -0.1},
        ];
        expect(node_count).toBe(1);
        expect(flat_ast.length).toBe(1);
        expect(flat_ast).toStrictEqual(expected);
    }
});

describe('expressions', () => {
    it('must produce a valid AST for arithmetic expressions', () => {
        const text: string       = "((+ 1) 2)";
        const parsed             = parse(lex(text));
        const node_count: number = parsed.node_count;
        const flat_ast: Flat_AST = flatten(parsed.ast, parsed.node_count);

        const expected: Flat_Expression[] = [
            {id: 0, token: 0, kind: 'Flat_Call', body: {id: 1}, arg: {id: 4}},
            {id: 1, token: 1, kind: 'Flat_Call', body: {id: 2}, arg: {id: 3}},
            {id: 2, token: 2, kind: 'Flat_Identifier', name: '+'},
            {id: 3, token: 4, kind: 'Flat_Literal', value: 1},
            {id: 4, token: 7, kind: 'Flat_Literal', value: 2},
        ];
        
        expect(node_count).toBe(5);
        expect(flat_ast.length).toBe(5);
        expect(flat_ast).toStrictEqual(expected);
    });

    it('must produce a valid AST for a simple lambda expression', () => {
        const text: string       = "((lambda x x) 42)";
        const parsed             = parse(lex(text));
        const node_count: number = parsed.node_count;
        const flat_ast: Flat_AST = flatten(parsed.ast, parsed.node_count);

        const expected: Flat_Expression[] = [
            {id: 0, token: 0, kind: 'Flat_Call', body: {id: 1}, arg: {id: 4}},
            {id: 1, token: 1, kind: 'Flat_Lambda', binding: {id: 2}, body: {id: 3}},
            {id: 2, token: 4, kind: 'Flat_Binding', name: 'x'},
            {id: 3, token: 6, kind: 'Flat_Identifier', name: 'x'},
            {id: 4, token: 9, kind: 'Flat_Literal', value: 42},
        ];
        
        expect(node_count).toBe(5);
        expect(flat_ast.length).toBe(5);
        expect(flat_ast).toStrictEqual(expected);
    });

    it('must produce a valid AST for lambda expressions', () => {
        const text: string       = "(((lambda a (lambda b a)) 1) 2)";
        const parsed             = parse(lex(text));
        const node_count: number = parsed.node_count;
        const flat_ast: Flat_AST = flatten(parsed.ast, parsed.node_count);

        const expected: Flat_Expression[] = [
            {id: 0, token:  0, kind: 'Flat_Call', body: {id: 1}, arg: {id: 8}},
            {id: 1, token:  1, kind: 'Flat_Call', body: {id: 2}, arg: {id: 7}},
            {id: 2, token:  2, kind: 'Flat_Lambda', binding: {id: 3}, body: {id: 4}},
            {id: 3, token:  5, kind: 'Flat_Binding', name: 'a'},
            {id: 4, token:  7, kind: 'Flat_Lambda', binding: {id: 5}, body: {id: 6}},
            {id: 5, token: 10, kind: 'Flat_Binding', name: 'b'},
            {id: 6, token: 12, kind: 'Flat_Identifier', name: 'a'},
            {id: 7, token: 16, kind: 'Flat_Literal', value: 1},
            {id: 8, token: 19, kind: 'Flat_Literal', value: 2}
        ];

        expect(node_count).toBe(9);
        expect(flat_ast.length).toBe(9);
        expect(flat_ast).toStrictEqual(expected);
    });

    it('must produce a valid AST for let-bindings', () => {
        const text: string       = "(let x 42 x)";
        const parsed             = parse(lex(text));
        const node_count: number = parsed.node_count;
        const flat_ast: Flat_AST = flatten(parsed.ast, parsed.node_count);

        const expected: Flat_Expression[] = [
            {id: 0, token: 0, kind: 'Flat_Let', binding: {id: 1}, value: {id: 2}, body: {id: 3}},
            {id: 1, token: 3, kind: 'Flat_Binding', name: 'x'},
            {id: 2, token: 5, kind: 'Flat_Literal', value: 42},
            {id: 3, token: 7, kind: 'Flat_Identifier', name: 'x'},
        ];

        expect(node_count).toBe(4);
        expect(flat_ast.length).toBe(4);
        expect(flat_ast).toStrictEqual(expected);
    });

    it('must produce a valid AST when let-binding to a function', () => {
        const text: string       = "(let increment (lambda x ((+ 1) x)) (increment 41))";
        const parsed             = parse(lex(text));
        const node_count: number = parsed.node_count;
        const flat_ast: Flat_AST = flatten(parsed.ast, parsed.node_count);

        const expected: Flat_Expression[] = [
            {id:  0, token:  0, kind: 'Flat_Let', binding: {id: 1}, value: {id: 2}, body: {id: 9}},
            {id:  1, token:  3, kind: 'Flat_Binding', name: 'increment'},
            {id:  2, token:  5, kind: 'Flat_Lambda', binding: {id: 3}, body: {id: 4}},
            {id:  3, token:  8, kind: 'Flat_Binding', name: 'x'},
            {id:  4, token: 10, kind: 'Flat_Call', body: {id: 5}, arg: {id: 8}}, // 8 is large
            {id:  5, token: 11, kind: 'Flat_Call', body: {id: 6}, arg: {id: 7}},
            {id:  6, token: 12, kind: 'Flat_Identifier', name: '+'},
            {id:  7, token: 14, kind: 'Flat_Literal', value: 1},
            {id:  8, token: 17, kind: 'Flat_Identifier', name: 'x'},
            {id:  9, token: 21, kind: 'Flat_Call', body: {id: 10}, arg: {id: 11}},
            {id: 10, token: 22, kind: 'Flat_Identifier', name: 'increment'},
            {id: 11, token: 24, kind: 'Flat_Literal', value: 41},
        ];

        expect(node_count).toBe(12);
        expect(flat_ast.length).toBe(12);
        expect(flat_ast).toStrictEqual(expected);
    });
});
