import { describe, it, expect } from 'vitest'
import { NodeAtom, NodeCall, NodeExpression, NodeIdentifier, Node, parse } from '../src/parser.ts'
import { Token, TokenLeft, TokenRight, TokenAdd, TokenNumber } from '../src/lexer.ts'

describe('parse', () => {
    it('(', () => {
        const tokens: Token[] = [{kind: "TK_LEFT"} as TokenLeft]
        const ast: Node = parse(tokens);
        expect(ast.kind).toBe("ND_ERROR");
    });

    it('5', () => {
        const tokens: Token[] = [{kind: "TK_NUMBER", value: 5} as TokenNumber];
        const ast: Node = parse(tokens);
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

        const call: NodeCall = parse(tokens) as NodeCall;
        expect(call.kind).toBe("ND_CALL");
        expect(call.arguments.length).toBe(2);
        const procedure: NodeIdentifier = call.procedure as NodeIdentifier;
        expect(procedure.kind).toBe("ND_IDENTIFIER");
        expect(procedure.value).toBe("+");

        const left: NodeAtom = call.arguments[0] as NodeAtom;
        expect(left.kind).toBe("ND_ATOM");
        expect(left.value).toBe(1);

        const right: NodeAtom = call.arguments[1] as NodeAtom;
        expect(right.kind).toBe("ND_ATOM");
        expect(right.value).toBe(2);
    });

    it('(+ (+ 1 2) 3)', () => {
        const tokens: Token[] = [
            {kind: "TK_LEFT"} as TokenLeft,
            {kind: "TK_ADD"} as TokenAdd,
            {kind: "TK_LEFT"} as TokenLeft,
            {kind: "TK_NUMBER", value: 1} as TokenNumber,
            {kind: "TK_NUMBER", value: 2} as TokenNumber,
            {kind: "TK_RIGHT"} as TokenRight,
            {kind: "TK_NUMBER", value: 3} as TokenNumber,
            {kind: "TK_RIGHT"} as TokenRight,
        ]

        const outer_call: NodeCall = parse(tokens) as NodeCall;
        expect(outer_call.kind).toBe("ND_CALL");
        expect(outer_call.arguments.length).toBe(2);

        const outer_procedure: NodeIdentifier = outer_call.procedure as NodeIdentifier;
        expect(outer_procedure.kind).toBe("ND_IDENTIFIER");
        expect(outer_procedure.value).toBe("+");

        const inner_call: NodeCall = outer_call.arguments[0] as NodeCall;
        expect(inner_call.kind).toBe("ND_CALL");
        expect(inner_call.arguments.length).toBe(2);

        const inner_procedure: NodeIdentifier = outer_call.procedure as NodeIdentifier;
        expect(inner_procedure.kind).toBe("ND_IDENTIFIER");
        expect(inner_procedure.value).toBe("+");

        const inner_left: NodeAtom = inner_call.arguments[0] as NodeAtom;
        expect(inner_left.kind).toBe("ND_ATOM");
        expect(inner_left.value).toBe(1);

        const inner_right: NodeAtom = inner_call.arguments[1] as NodeAtom;
        expect(inner_right.kind).toBe("ND_ATOM");
        expect(inner_right.value).toBe(2);

        const outer_right: NodeAtom = outer_call.arguments[1] as NodeAtom;
        expect(outer_right.kind).toBe("ND_ATOM");
        expect(outer_right.value).toBe(3);
    });
})
