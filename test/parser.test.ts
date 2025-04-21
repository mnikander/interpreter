import { describe, it, expect } from 'vitest'
import { ASTNode, parse } from '../src/parser.ts'
import { Token } from '../src/lexer.ts'

describe('parse', () => {
    it('(', () => {
        const tokens: Token[] = [{kind: "TokenOpenParen", value: "("}]
        const [ast, index]: [ASTNode, number] = parse(tokens);
        expect(index).toBe(1);
        expect(ast.kind).toBe("ND_ERROR");
    });

    it('5', () => {
        const tokens: Token[] = [{kind: "TokenNumber", value: 5}];
        const [ast, index]: [ASTNode, number] = parse(tokens);
        expect(index).toBe(1);
        expect(ast.kind).toBe("ND_NUMBER");
        expect((ast as { kind: "ND_NUMBER", value: number }).value).toBe(5);
    });

    it('True', () => {
        const tokens: Token[] = [{kind: "TokenBoolean", value: true}];
        const [ast, index]: [ASTNode, number] = parse(tokens);
        expect(index).toBe(1);
        expect(ast.kind).toBe("ND_BOOLEAN");
        expect((ast as { kind: "ND_BOOLEAN", value: boolean }).value).toBe(true);
    });

    it('(+ 1 2)', () => {
        const tokens: Token[] = [
            {kind: "TokenOpenParen", value: "("},
            {kind: "TokenIdentifier", value: "+"},
            {kind: "TokenNumber", value: 1},
            {kind: "TokenNumber", value: 2},
            {kind: "TokenCloseParen", value: ")"},
        ]

        const [call, index]: [ASTNode, number] = parse(tokens) as [ASTNode, number];
        expect(index).toBe(5);
        expect(call.kind).toBe("ND_CALL");
        expect(call.params.length).toBe(2);
        const func: ASTNode = call.func;
        expect(func.kind).toBe("ND_IDENTIFIER");
        expect(func.value).toBe("+");

        const left: ASTNode = call.params[0];
        expect(left.kind).toBe("ND_NUMBER");
        expect(left.value).toBe(1);

        const right: ASTNode = call.params[1];
        expect(right.kind).toBe("ND_NUMBER");
        expect(right.value).toBe(2);
    });

    it('1 2', () => {
        // invalid input should fail, the '2' is unreachable, i.e. not part of the expression
        const tokens: Token[] = [
            {kind: "TokenNumber", value: 1},
            {kind: "TokenNumber", value: 2},
        ]

        const [ast, index] = parse(tokens);
        expect(index).toBe(1);
        expect(ast.kind).toBe("ND_ERROR");
    });

    it('(+ (+ 1 2) 3)', () => {
        const tokens: Token[] = [
            {kind: "TokenOpenParen", value: "("},
            {kind: "TokenIdentifier", value: "+"},
            {kind: "TokenOpenParen", value: "("},
            {kind: "TokenIdentifier", value: "+"},
            {kind: "TokenNumber", value: 1},
            {kind: "TokenNumber", value: 2},
            {kind: "TokenCloseParen", value: ")"},
            {kind: "TokenNumber", value: 3},
            {kind: "TokenCloseParen", value: ")"},
        ]

        const [outer_call, index]: [ASTNode, number] = parse(tokens) as [ASTNode, number];
        expect(index).toBe(9);
        expect(outer_call.kind).toBe("ND_CALL");
        expect(outer_call.params.length).toBe(2);

        const outer_func: ASTNode = outer_call.func;
        expect(outer_func.kind).toBe("ND_IDENTIFIER");
        expect(outer_func.value).toBe("+");

        const inner_call: ASTNode = outer_call.params[0];
        expect(inner_call.kind).toBe("ND_CALL");
        expect(inner_call.params.length).toBe(2);

        const inner_func: ASTNode = outer_call.func;
        expect(inner_func.kind).toBe("ND_IDENTIFIER");
        expect(inner_func.value).toBe("+");

        const inner_left: ASTNode = inner_call.params[0];
        expect(inner_left.kind).toBe("ND_NUMBER");
        expect(inner_left.value).toBe(1);

        const inner_right: ASTNode = inner_call.params[1];
        expect(inner_right.kind).toBe("ND_NUMBER");
        expect(inner_right.value).toBe(2);

        const outer_right: ASTNode = outer_call.params[1];
        expect(outer_right.kind).toBe("ND_NUMBER");
        expect(outer_right.value).toBe(3);
    });

    it('(+ 1 (+ 2 3))', () => {
        const tokens: Token[] = [
            {kind: "TokenOpenParen", value: "("},
            {kind: "TokenIdentifier", value: "+"},
            {kind: "TokenNumber", value: 1},
            {kind: "TokenOpenParen", value: "("},
            {kind: "TokenIdentifier", value: "+"},
            {kind: "TokenNumber", value: 2},
            {kind: "TokenNumber", value: 3},
            {kind: "TokenCloseParen", value: ")"},
            {kind: "TokenCloseParen", value: ")"},
        ]

        const [outer_call, index]: [ASTNode, number] = parse(tokens) as [ASTNode, number];
        expect(index).toBe(9);
        expect(outer_call.kind).toBe("ND_CALL");
        expect(outer_call.params.length).toBe(2);

        const outer_func: ASTNode = outer_call.func;
        expect(outer_func.kind).toBe("ND_IDENTIFIER");
        expect(outer_func.value).toBe("+");

        const outer_left: ASTNode = outer_call.params[0];
        expect(outer_left.kind).toBe("ND_NUMBER");
        expect(outer_left.value).toBe(1);

        const inner_call: ASTNode = outer_call.params[1];
        expect(inner_call.kind).toBe("ND_CALL");
        expect(inner_call.params.length).toBe(2);

        const inner_func: ASTNode = outer_call.func;
        expect(inner_func.kind).toBe("ND_IDENTIFIER");
        expect(inner_func.value).toBe("+");

        const inner_left: ASTNode = inner_call.params[0];
        expect(inner_left.kind).toBe("ND_NUMBER");
        expect(inner_left.value).toBe(2);

        const inner_right: ASTNode = inner_call.params[1];
        expect(inner_right.kind).toBe("ND_NUMBER");
        expect(inner_right.value).toBe(3);
    });
});
