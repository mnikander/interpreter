import { describe, it, expect } from 'vitest'
import { NodeAtom, NodeCall, NodeExpression, NodeIdentifier, Node, parse } from '../src/parser.ts'
import { Token, TokenLeft, TokenRight, TokenAdd, TokenNumber } from '../src/lexer.ts'

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
        expect(ast.kind).toBe("ND_ATOM");
        expect((ast as NodeAtom).value).toBe(5);
    });

    it('(+ 1 2)', () => {
        const tokens: Token[] = [
            {kind: "TK_LEFT"} as TokenLeft,
            {kind: "TK_ADD"} as TokenAdd,
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

        const left: NodeAtom = call.params[0] as NodeAtom;
        expect(left.kind).toBe("ND_ATOM");
        expect(left.value).toBe(1);

        const right: NodeAtom = call.params[1] as NodeAtom;
        expect(right.kind).toBe("ND_ATOM");
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
            {kind: "TK_ADD"} as TokenAdd,
            {kind: "TK_LEFT"} as TokenLeft,
            {kind: "TK_ADD"} as TokenAdd,
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

        const inner_left: NodeAtom = inner_call.params[0] as NodeAtom;
        expect(inner_left.kind).toBe("ND_ATOM");
        expect(inner_left.value).toBe(1);

        const inner_right: NodeAtom = inner_call.params[1] as NodeAtom;
        expect(inner_right.kind).toBe("ND_ATOM");
        expect(inner_right.value).toBe(2);

        const outer_right: NodeAtom = outer_call.params[1] as NodeAtom;
        expect(outer_right.kind).toBe("ND_ATOM");
        expect(outer_right.value).toBe(3);
    });

    it('(+ 1 (+ 2 3))', () => {
        const tokens: Token[] = [
            {kind: "TK_LEFT"} as TokenLeft,
            {kind: "TK_ADD"} as TokenAdd,
            {kind: "TK_NUMBER", value: 1} as TokenNumber,
            {kind: "TK_LEFT"} as TokenLeft,
            {kind: "TK_ADD"} as TokenAdd,
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

        const outer_left: NodeAtom = outer_call.params[0] as NodeAtom;
        expect(outer_left.kind).toBe("ND_ATOM");
        expect(outer_left.value).toBe(1);

        const inner_call: NodeCall = outer_call.params[1] as NodeCall;
        expect(inner_call.kind).toBe("ND_CALL");
        expect(inner_call.params.length).toBe(2);

        const inner_func: NodeIdentifier = outer_call.func as NodeIdentifier;
        expect(inner_func.kind).toBe("ND_IDENTIFIER");
        expect(inner_func.value).toBe("+");

        const inner_left: NodeAtom = inner_call.params[0] as NodeAtom;
        expect(inner_left.kind).toBe("ND_ATOM");
        expect(inner_left.value).toBe(2);

        const inner_right: NodeAtom = inner_call.params[1] as NodeAtom;
        expect(inner_right.kind).toBe("ND_ATOM");
        expect(inner_right.value).toBe(3);
    });
})
