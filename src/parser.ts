// Copyright (c) 2025 Marco Nikander

import { is_tk_number, is_tk_identifier, is_tk_left, is_tk_right, Token } from "./lexer";

export interface Node {
    kind: string,
}

export interface NodeNumber extends Node {
    kind: "ND_NUMBER",
    value: number,
}

export interface NodeIdentifier extends Node {
    kind: "ND_IDENTIFIER",
    value: string,
}

export interface NodeCall extends Node {
    kind: "ND_CALL",
    func: Node,
    params: Node[],
}

export interface ParseError extends Node {
    kind: "ND_ERROR",
    value: string,
}

export type NodeAtom = NodeNumber | NodeIdentifier;
export type NodeExpression = NodeAtom | NodeCall;

export function is_nd_number(node: Node): boolean {
    return node.kind == "ND_NUMBER";
}

export function is_nd_identifier(node: Node): boolean {
    return node.kind == "ND_IDENTIFIER";
}

export function is_nd_call(node: Node): boolean {
    return node.kind == "ND_CALL";
}

export function is_nd_error(node: Node): boolean {
    return node.kind == "ND_ERROR";
}

export function parse(tokens: Token[]): [(ParseError | NodeExpression), number] {
    let [expression, index] = parse_expression(tokens, 0);
    if (index == tokens.length) {
        return [expression, index];
    }
    else if (index < tokens.length) {
        return [{kind: "ND_ERROR", value: "expected a single expression"} as ParseError, index];
    }
    else {
        return [{kind: "ND_ERROR", value: "not all tokens could be evaluated"} as ParseError, index];
    }
}

export function parse_expression(tokens: readonly Token[], index: number = 0): [(ParseError | NodeExpression), number] {
    if (index < tokens.length) {
        let token: Token = tokens[index];

        if (is_tk_number(token)) {
            index++; // consume the TK_NUMBER
            return [{kind: "ND_NUMBER", value: token.value} as NodeNumber, index];
        }
        else if (is_tk_identifier(token)) {
            index++; // consume the TK_IDENTIFIER
            return [{kind: "ND_IDENTIFIER", value: token.value} as NodeIdentifier, index];
        }
        else if (is_tk_left(token)) {
            index++; // consume the TK_LEFT
            let func: Node = {kind: "ND_DEFAULT"};
            let params: Node[] = [];
            [func, index] = parse_expression(tokens, index);

            while (index < tokens.length) {
                if (is_tk_right(tokens[index])) {
                    index++; // consume the TK_RIGHT
                    return [{kind: "ND_CALL", func: func, params: params} as NodeCall, index];
                }
                else {
                    let node: Node = {kind: "ND_DEFAULT"};
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

export function check_for_errors(ast: Node): undefined | ParseError {
    if (ast.kind == "ND_ERROR") {
        return (ast as ParseError); // found an error
    }
    else if (ast.kind == "ND_CALL") {
        const call = (ast as NodeCall);
        if (check_for_errors(call.func) !== undefined) {
            return (ast as ParseError); // function is not ok
        }
        else { // func is ok, check params
            let aggregate: undefined | ParseError = undefined;
            for (let arg of call.params) {
                if (check_for_errors(arg) !== undefined) {
                    return (arg as ParseError); // parameters are not ok
                }
            }
            return undefined; // all params are ok as well
        }
    }
    else {
        return undefined; // everything is ok
    }
}
