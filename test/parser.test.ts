import { describe, it, expect } from 'vitest'
import { ASTNode, is_nd_call, is_nd_identifier, is_nd_let, NodeBoolean, NodeNumber, parse } from '../src/parser'
import { Token, tokenize } from '../src/lexer'
import { Error, is_error } from '../src/error';

describe('parse', () => {
    it('must report an error for a lone opening parenthesis', () => {
        const tokens: Token[] = [{kind: "TokenOpenParen", value: "("}]
        const result: Error | [ASTNode, number] = parse(tokens);
        expect(Array.isArray(result)).toBe(false);
        expect(is_error(result)).toBe(true);
        expect((result as Error).kind).toBe("Parsing error");
    });

    it('must report an error for a lone closing parenthesis', () => {
        const tokens: Token[] = [{kind: "TokenCloseParen", value: ")"}]
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
        expect((ast as NodeNumber).value).toBe(5);
    });

    it('must parse a boolean token', () => {
        const tokens: Token[] = [{kind: "TokenBoolean", value: true}];
        const result: Error | [ASTNode, number] = parse(tokens);
        expect(Array.isArray(result)).toBe(true);
        expect(is_error(result)).toBe(false);
        const [ast, index] = result as [ASTNode, number];
        expect(index).toBe(1);
        expect(ast.kind).toBe("ND_BOOLEAN");
        expect((ast as NodeBoolean).value).toBe(true);
    });

    it('must parse a simple let-binding', () => {
        const tokens: Error | Token[] = tokenize('(let x 42 x)');
        expect(is_error(tokens)).toBe(false);
        const result: Error | [ASTNode, number] = parse(tokens as Token[]);
        expect(is_error(result)).toBe(false);
        if (!is_error(result)) {
            const [ast, index] = result;
            expect(is_nd_let(ast)).toBe(true);
            if (is_nd_let(ast)) {
                expect(is_nd_identifier(ast.name)).toBe(true);
                expect(ast.name).toStrictEqual({ kind: "ND_IDENTIFIER", token_id: 2, value: "x" });
                expect(ast.expr).toStrictEqual({ kind: "ND_NUMBER", token_id: 3, value: 42} );
                expect(ast.body).toStrictEqual({ kind: "ND_IDENTIFIER", token_id: 4, value: "x" });
            }
        }
    });

    it('must parse a nested let-binding', () => {
        const tokens: Error | Token[] = tokenize('(let x (* 4 10) (+ x 2))');
        expect(is_error(tokens)).toBe(false);
        const result: Error | [ASTNode, number] = parse(tokens as Token[]);
        expect(is_error(result)).toBe(false);
        if (!is_error(result)) {
            const [ast, index] = result;
            expect(is_nd_let(ast)).toBe(true);
            if (is_nd_let(ast)) {
                expect(is_nd_identifier(ast.name)).toBe(true);
                expect(ast.name).toStrictEqual({ kind: "ND_IDENTIFIER", token_id: 2, value: "x" });
                expect(is_nd_call(ast.expr)).toBe(true);
                if(is_nd_call(ast.expr)) {
                    expect(ast.expr.func).toStrictEqual({ kind: "ND_IDENTIFIER", token_id: 4, value: '*'} );
                    expect(ast.expr.params[0]).toStrictEqual({ kind: "ND_NUMBER", token_id: 5, value: 4} );
                    expect(ast.expr.params[1]).toStrictEqual({ kind: "ND_NUMBER", token_id: 6, value: 10} );
                }
                expect(is_nd_call(ast.body)).toBe(true);
                if (is_nd_call(ast.body)) {
                    expect(ast.body.func).toStrictEqual({ kind: "ND_IDENTIFIER", token_id: 9, value: "+"} );
                    expect(ast.body.params.length).toBe(2);
                    expect(ast.body.params[0]).toStrictEqual({ kind: "ND_IDENTIFIER", token_id: 10, value: "x"} );
                    expect(ast.body.params[1]).toStrictEqual({ kind: "ND_NUMBER", token_id: 11, value: 2} );
                }
            }
        }
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
