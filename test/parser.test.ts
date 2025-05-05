import { describe, it, expect } from 'vitest'
import { ASTNode, parse } from '../src/parser'
import { Token } from '../src/lexer'
import { Error, is_error } from '../src/error';

describe('parse', () => {
    it('must report an error for an incomplete sequence of tokens', () => {
        const tokens: Token[] = [{kind: "TokenOpenParen", value: "("}]
        const result: Error | [ASTNode, number] = parse(tokens);
        expect(Array.isArray(result)).toBe(false);
        expect(is_error(result)).toBe(true);
        expect((result as Error).kind).toBe("Parsing error");
    });

    it('must parse an integer token', () => {
        const tokens: Token[] = [{kind: "TokenNumber", value: 5}];
        const result: Error | [ASTNode, number] = parse(tokens);
        expect(Array.isArray(result)).toBe(true);
        expect(is_error(result)).toBe(false);
        const [ast, index] = result as [ASTNode, number];
        expect(index).toBe(1);
        expect(ast.kind).toBe("ND_NUMBER");
        expect((ast as { kind: "ND_NUMBER", value: number }).value).toBe(5);
    });

    it('must parse a boolean token', () => {
        const tokens: Token[] = [{kind: "TokenBoolean", value: true}];
        const result: Error | [ASTNode, number] = parse(tokens);
        expect(Array.isArray(result)).toBe(true);
        expect(is_error(result)).toBe(false);
        const [ast, index] = result as [ASTNode, number];
        expect(index).toBe(1);
        expect(ast.kind).toBe("ND_BOOLEAN");
        expect((ast as { kind: "ND_BOOLEAN", value: boolean }).value).toBe(true);
    });

    it('must report an error when tokens for multiple unrelated expressions are parsed', () => {
        // invalid input should fail, the '2' is unreachable, i.e. not part of the expression
        const tokens: Token[] = [
            {kind: "TokenNumber", value: 1},
            {kind: "TokenNumber", value: 2},
        ]

        const result: Error | [ASTNode, number] = parse(tokens);
        expect(Array.isArray(result)).toBe(false);
        expect(is_error(result)).toBe(true);
        expect((result as Error).kind).toBe("Parsing error");
    });
});
