// Copyright (c) 2025 Marco Nikander

import { is_tk_add, is_tk_left, is_tk_number, is_tk_right, Token } from "./lexer";

export interface Node {
    kind: string,
}

export interface NodeAtom extends Node {
    kind: "ND_ATOM",
    value: number | string,
}

export interface NodeCall extends Node {
    kind: "ND_CALL",
    func: Node,
    params: Node[],
}

export type NodeExpression = NodeAtom | NodeCall | NodeIdentifier;

export interface NodeIdentifier extends Node {
    kind: "ND_IDENTIFIER",
    value: string,
}

export interface ParseError extends Node {
    kind: "ND_ERROR",
    value: string,
}

export function parse_expression(tokens: readonly Token[], index: number = 0): [(ParseError | NodeExpression), number] {
    if (index < tokens.length) {
        let token: Token = tokens[index];

        if (is_tk_number(token)) {
            index++; // consume the TK_NUMBER
            return [{kind: "ND_ATOM", value: token.value} as NodeAtom, index];
        }
        else if (is_tk_add(token)) {
            index++; // consume the TK_ADD
            return [{kind: "ND_IDENTIFIER", value: "+"} as NodeIdentifier, index];
        }
        else if (is_tk_left(token)) {
            index++; // consume the TK_LEFT
            let func: Node = {kind: "ND_EMPTY"};
            let params: Node[] = [];
            [func, index] = parse_expression(tokens, index);

            while (index < tokens.length) {
                if (is_tk_right(tokens[index])) {
                    index++; // consume the TK_RIGHT
                    return [{kind: "ND_CALL", func: func, params: params} as NodeCall, index];
                }
                else {
                    let node: Node = {kind: "ND_EMPTY"};
                    [node, index] = parse_expression(tokens, index);
                    params.push(node);
                }
            }
            return [{kind: "ND_ERROR", value: "expected closing parentheses"} as ParseError, index];
        }
        else {
            index++; // consume the unparsable token
            return [{kind: "ND_ERROR", value: `unable to parse token of kind ${tokens[index].kind}`} as ParseError, index];
        }
    }
    else {
        return [{kind: "ND_ERROR", value: "expected another token"} as ParseError, index];
    }
}
