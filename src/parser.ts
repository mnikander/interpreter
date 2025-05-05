// Copyright (c) 2025 Marco Nikander

import { is_tk_boolean, is_tk_number, is_tk_identifier, is_tk_left, is_tk_right, Token } from "./lexer";
import { Error, is_error } from "./error";

export type ParseResult = Error | [ASTNode, number];

export type ASTAtom =
    | NodeBoolean
    | NodeNumber
    | NodeIdentifier;

export type ASTNode =
    | ASTAtom
    | NodeCall
    | NodeLet;

export interface NodeBoolean    { kind: "ND_BOOLEAN",    value: boolean };
export interface NodeNumber     { kind: "ND_NUMBER",     value: number };
export interface NodeIdentifier { kind: "ND_IDENTIFIER", value: string };
export interface NodeCall       { kind: "ND_CALL",       func: ASTNode, params: ASTNode[] };
export interface NodeLet        { kind: "ND_LET",        name: NodeIdentifier, expr: ASTNode, body: ASTNode };

export function is_nd_boolean(node: ASTNode): node is NodeBoolean {
    return node.kind == "ND_BOOLEAN";
}

export function is_nd_number(node: ASTNode): node is NodeNumber {
    return node.kind == "ND_NUMBER";
}

export function is_nd_identifier(node: ASTNode): node is NodeIdentifier {
    return node.kind == "ND_IDENTIFIER";
}

export function is_nd_call(node: ASTNode): node is NodeCall {
    return node.kind == "ND_CALL";
}

export function is_nd_let(node: ASTNode): node is NodeLet {
    return node.kind == "ND_LET";
}

export function parse(tokens: Token[]): Error | [ASTNode, number] {
    let result = parse_expression(tokens, 0);
    if(is_error(result)) {
        return result;
    }
    else {
        let [expression, index] = result;
        if (index == tokens.length) {
            return [expression, index];
        }
        else if (index < tokens.length) {
            return { kind: "Parsing error", message: "expected a single expression"};
        }
        else {
            return { kind: "Parsing error", message: "not all tokens could be evaluated"};
        }
    }
}

export function parse_expression(tokens: readonly Token[], index: number = 0): Error | [ASTNode, number] {
    if (index < tokens.length) {
        let token: Token = tokens[index];
        index++; // consume the token

        if (is_tk_boolean(token)) {
            return [{kind: "ND_BOOLEAN", value: token.value}, index];
        }
        else if (is_tk_number(token)) {
            return [{kind: "ND_NUMBER", value: token.value}, index];
        }
        else if (is_tk_identifier(token)) {
            return [{kind: "ND_IDENTIFIER", value: token.value}, index];
        }
        else if (is_tk_left(token) && index < tokens.length) {
            if (is_let(tokens[index])) {
                return parse_let(tokens, index);
            }
            else {
                return parse_call(tokens, index);
            }
        }
        else if (is_tk_right(token)) {
            // closing parentheses are handled by the parsers specific to function calls, let-bindings, etc
            // a closing parenthesis should never occur in the control flow of this general parsing function
            return {kind: "Parsing error", message: `unexpected ')'`};
        }
        else {
            return {kind: "Parsing error", message: 'unknown token type'};
        }
    }
    else {
        return {kind: "Parsing error", message: "expected another token"};
    }
}

function parse_call(tokens: readonly Token[], index: number = 0): Error | [NodeCall, number] {
    let params: ASTNode[] = [];
    let result: ParseResult = parse_expression(tokens, index);
    if(is_error(result)) return result;

    const func: ASTNode = result[0];
    while (result[1] < tokens.length) {
        if (is_tk_right(tokens[result[1]])) {
            result = consumeToken(result); // consume the TK_RIGHT
            return [{kind: "ND_CALL", func: func, params: params}, result[1]];
        }
        else {
            result = parse_expression(tokens, result[1]);
            if (is_error(result)) return result;
            params.push(result[0]);
        }
    }
    return {kind: "Parsing error", message: "expected closing parentheses"};
}

function is_let(token: Token): boolean {
    return is_tk_identifier(token) && token.value === "let";
}

function parse_let(tokens: readonly Token[], index: number = 0): Error | [NodeLet, number] {
    index++; // consume the TK_IDENTIFIER which is equal to "let"

    let result: ParseResult = parse_expression(tokens, index);
    if (is_error(result)) return result;
    const name: ASTNode = result[0];
    if (!is_nd_identifier(name))
        return { kind: "Parsing error", message: `let-binding expects an identifier to define but got a '${name.kind}' instead` };

    result = parse_expression(tokens, result[1]);
    if (is_error(result)) return result;
    const expr = result[0];

    result = parse_expression(tokens, result[1]);
    if (is_error(result)) return result;
    const body = result[0];

    if (!is_tk_right(tokens[result[1]])) {
        return { kind: 'Parsing error', message: `too many arguments for let-binding, expected 3` };
    }

    result = consumeToken(result); // consume the TokenCloseParen
    return [{ kind: "ND_LET", name: name, expr: expr, body: body }, result[1]];
}

function consumeToken(result: [ASTNode, number]): [ASTNode, number] {
    let [ast, index] = result;
    index++;
    return [ast, index];
}
