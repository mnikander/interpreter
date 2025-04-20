import { describe, it, expect } from 'vitest'
import { NodeNumber, NodeCall, NodeExpression, NodeIdentifier, Node, parse } from '../src/parser.ts'
import { Token, TokenBoolean, TokenNumber, TokenIdentifier, TokenLeft, TokenRight } from '../src/lexer.ts'

describe('parse', () => {
    it('(', () => {
        const tokens: Token[] = [{kind: "TK_LEFT"} as TokenLeft]
        const [ast, index]: [Node, number] = parse(tokens);
        expect(index).toBe(1);
        expect(ast.kind).toBe("ND_ERROR");
    });

    it('5', () => {
        const tokens: Token[] = [{kind: "TK_NUMBER", value: 5} as TokenNumber];
        const [ast, index]: [Node, number] = parse(tokens);
        expect(index).toBe(1);
        expect(ast.kind).toBe("ND_NUMBER");
        expect((ast as NodeNumber).value).toBe(5);
    });

    it('True', () => {
        const tokens: Token[] = [{kind: "TK_BOOLEAN", value: true} as TokenBoolean];
        const [ast, index]: [Node, number] = parse(tokens);
        expect(index).toBe(1);
        expect(ast.kind).toBe("ND_BOOLEAN");
        expect((ast as NodeNumber).value).toBe(true);
    });

    it('(+ 1 2)', () => {
        const tokens: Token[] = [
            {kind: "TK_LEFT"} as TokenLeft,
            {kind: "TK_IDENTIFIER", value: "+"} as TokenIdentifier,
            {kind: "TK_NUMBER", value: 1} as TokenNumber,
            {kind: "TK_NUMBER", value: 2} as TokenNumber,
            {kind: "TK_RIGHT"} as TokenRight,
        ]

        const [call, index]: [NodeCall, number] = parse(tokens) as [NodeCall, number];
        expect(index).toBe(5);
        expect(call.kind).toBe("ND_CALL");
        expect(call.params.length).toBe(2);
        const func: NodeIdentifier = call.func as NodeIdentifier;
        expect(func.kind).toBe("ND_IDENTIFIER");
        expect(func.value).toBe("+");

        const left: NodeNumber = call.params[0] as NodeNumber;
        expect(left.kind).toBe("ND_NUMBER");
        expect(left.value).toBe(1);

        const right: NodeNumber = call.params[1] as NodeNumber;
        expect(right.kind).toBe("ND_NUMBER");
        expect(right.value).toBe(2);
    });

    it('1 2', () => {
        // invalid input should fail, the '2' is unreachable, i.e. not part of the expression
        const tokens: Token[] = [
            {kind: "TK_NUMBER", value: 1} as TokenNumber,
            {kind: "TK_NUMBER", value: 2} as TokenNumber,
        ]

        const [ast, index] = parse(tokens);
        expect(index).toBe(1);
        expect(ast.kind).toBe("ND_ERROR");
    });

    it('(+ (+ 1 2) 3)', () => {
        const tokens: Token[] = [
            {kind: "TK_LEFT"} as TokenLeft,
            {kind: "TK_IDENTIFIER", value: "+"} as TokenIdentifier,
            {kind: "TK_LEFT"} as TokenLeft,
            {kind: "TK_IDENTIFIER", value: "+"} as TokenIdentifier,
            {kind: "TK_NUMBER", value: 1} as TokenNumber,
            {kind: "TK_NUMBER", value: 2} as TokenNumber,
            {kind: "TK_RIGHT"} as TokenRight,
            {kind: "TK_NUMBER", value: 3} as TokenNumber,
            {kind: "TK_RIGHT"} as TokenRight,
        ]

        const [outer_call, index]: [NodeCall, number] = parse(tokens) as [NodeCall, number];
        expect(index).toBe(9);
        expect(outer_call.kind).toBe("ND_CALL");
        expect(outer_call.params.length).toBe(2);

        const outer_func: NodeIdentifier = outer_call.func as NodeIdentifier;
        expect(outer_func.kind).toBe("ND_IDENTIFIER");
        expect(outer_func.value).toBe("+");

        const inner_call: NodeCall = outer_call.params[0] as NodeCall;
        expect(inner_call.kind).toBe("ND_CALL");
        expect(inner_call.params.length).toBe(2);

        const inner_func: NodeIdentifier = outer_call.func as NodeIdentifier;
        expect(inner_func.kind).toBe("ND_IDENTIFIER");
        expect(inner_func.value).toBe("+");

        const inner_left: NodeNumber = inner_call.params[0] as NodeNumber;
        expect(inner_left.kind).toBe("ND_NUMBER");
        expect(inner_left.value).toBe(1);

        const inner_right: NodeNumber = inner_call.params[1] as NodeNumber;
        expect(inner_right.kind).toBe("ND_NUMBER");
        expect(inner_right.value).toBe(2);

        const outer_right: NodeNumber = outer_call.params[1] as NodeNumber;
        expect(outer_right.kind).toBe("ND_NUMBER");
        expect(outer_right.value).toBe(3);
    });

    it('(+ 1 (+ 2 3))', () => {
        const tokens: Token[] = [
            {kind: "TK_LEFT"} as TokenLeft,
            {kind: "TK_IDENTIFIER", value: "+"} as TokenIdentifier,
            {kind: "TK_NUMBER", value: 1} as TokenNumber,
            {kind: "TK_LEFT"} as TokenLeft,
            {kind: "TK_IDENTIFIER", value: "+"} as TokenIdentifier,
            {kind: "TK_NUMBER", value: 2} as TokenNumber,
            {kind: "TK_NUMBER", value: 3} as TokenNumber,
            {kind: "TK_RIGHT"} as TokenRight,
            {kind: "TK_RIGHT"} as TokenRight,
        ]

        const [outer_call, index]: [NodeCall, number] = parse(tokens) as [NodeCall, number];
        expect(index).toBe(9);
        expect(outer_call.kind).toBe("ND_CALL");
        expect(outer_call.params.length).toBe(2);

        const outer_func: NodeIdentifier = outer_call.func as NodeIdentifier;
        expect(outer_func.kind).toBe("ND_IDENTIFIER");
        expect(outer_func.value).toBe("+");

        const outer_left: NodeNumber = outer_call.params[0] as NodeNumber;
        expect(outer_left.kind).toBe("ND_NUMBER");
        expect(outer_left.value).toBe(1);

        const inner_call: NodeCall = outer_call.params[1] as NodeCall;
        expect(inner_call.kind).toBe("ND_CALL");
        expect(inner_call.params.length).toBe(2);

        const inner_func: NodeIdentifier = outer_call.func as NodeIdentifier;
        expect(inner_func.kind).toBe("ND_IDENTIFIER");
        expect(inner_func.value).toBe("+");

        const inner_left: NodeNumber = inner_call.params[0] as NodeNumber;
        expect(inner_left.kind).toBe("ND_NUMBER");
        expect(inner_left.value).toBe(2);

        const inner_right: NodeNumber = inner_call.params[1] as NodeNumber;
        expect(inner_right.kind).toBe("ND_NUMBER");
        expect(inner_right.value).toBe(3);
    });
});
