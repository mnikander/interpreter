import { describe, it, expect } from 'vitest'
import { ASTNode, parse } from '../src/parser'
import { Token } from '../src/lexer'
import { Error } from '../src/error';

describe('parse', () => {
    it('(', () => {
        const tokens: Token[] = [{kind: "TokenOpenParen", value: "("}]
        const result: Error | [ASTNode, number] = parse(tokens);
        expect(Array.isArray(result)).toBe(false);
        expect((result as Error).kind).toBe("Parsing Error");
    });

    it('5', () => {
        const tokens: Token[] = [{kind: "TokenNumber", value: 5}];
        const result: Error | [ASTNode, number] = parse(tokens);
        expect(Array.isArray(result)).toBe(true);
        const [ast, index] = result as [ASTNode, number];
        expect(index).toBe(1);
        expect(ast.kind).toBe("ND_NUMBER");
        expect((ast as { kind: "ND_NUMBER", value: number }).value).toBe(5);
    });

    it('True', () => {
        const tokens: Token[] = [{kind: "TokenBoolean", value: true}];
        const result: Error | [ASTNode, number] = parse(tokens);
        expect(Array.isArray(result)).toBe(true);
        const [ast, index] = result as [ASTNode, number];
        expect(index).toBe(1);
        expect(ast.kind).toBe("ND_BOOLEAN");
        expect((ast as { kind: "ND_BOOLEAN", value: boolean }).value).toBe(true);
    });

    it('1 2', () => {
        // invalid input should fail, the '2' is unreachable, i.e. not part of the expression
        const tokens: Token[] = [
            {kind: "TokenNumber", value: 1},
            {kind: "TokenNumber", value: 2},
        ]

        const result: Error | [ASTNode, number] = parse(tokens);
        expect(Array.isArray(result)).toBe(false);
        expect((result as Error).kind).toBe("Parsing Error");
    });
});
