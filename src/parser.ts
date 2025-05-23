// Copyright (c) 2025 Marco Nikander

import { is_tk_boolean, is_tk_number, is_tk_identifier, is_tk_left, is_tk_right, Token } from "./lexer";
import { Error, number_of_arguments_error, is_error } from "./error";

export type ParseResult = Error | [ASTNode, number];

export type ASTAtom =
    | NodeBoolean
    | NodeNumber
    | NodeIdentifier;

export type ASTNode =
    | ASTAtom
    | NodeCall
    | NodeLet;

export interface NodeBoolean    { kind: "ND_BOOLEAN",    token_id: number, value: boolean };
export interface NodeNumber     { kind: "ND_NUMBER",     token_id: number, value: number };
export interface NodeIdentifier { kind: "ND_IDENTIFIER", token_id: number, value: string };
export interface NodeCall       { kind: "ND_CALL",       token_id: number, func: ASTNode, params: ASTNode[] };
export interface NodeLet        { kind: "ND_LET",        token_id: number, name: NodeIdentifier, expr: ASTNode, body: ASTNode };

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
        if (result[1] == tokens.length) {
            return [expression, result[1]];
        }
        else if (result[1] < tokens.length) {
            return { kind: "Parsing error", token_id: result[1], message: "expected a single expression"};
        }
        else {
            return { kind: "Parsing error", token_id: result[1], message: "not all tokens could be evaluated"};
        }
    }
}

export function parse_expression(tokens: readonly Token[], index: number = 0): Error | [ASTNode, number] {
    if (index < tokens.length) {
        let token: Token = tokens[index];
        index++; // consume the token

        if (is_tk_boolean(token)) {
            return [{kind: "ND_BOOLEAN", token_id: index-1, value: token.value}, index];
        }
        else if (is_tk_number(token)) {
            return [{kind: "ND_NUMBER", token_id: index-1, value: token.value}, index];
        }
        else if (is_tk_identifier(token)) {
            return [{kind: "ND_IDENTIFIER", token_id: index-1, value: token.value}, index];
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
            return {kind: "Parsing error", token_id: index-1, message: `unexpected ')'`};
        }
        else {
            return {kind: "Parsing error", token_id: index-1, message: 'unknown token type'};
        }
    }
    else {
        return {kind: "Parsing error", token_id: index-1, message: "expected more tokens"};
    }
}

function parse_call(tokens: readonly Token[], index: number = 0): Error | [NodeCall, number] {
    let params: ASTNode[] = [];
    const start_num = index;
    let result: ParseResult = parse_expression(tokens, index);
    if(is_error(result)) return result;

    const func: ASTNode = result[0];
    while (result[1] < tokens.length) {
        if (is_tk_right(tokens[result[1]])) {
            result = consumeToken(result); // consume the TK_RIGHT
            return [{kind: "ND_CALL", token_id: start_num, func: func, params: params}, result[1]];
        }
        else {
            result = parse_expression(tokens, result[1]);
            if (is_error(result)) return result;
            params.push(result[0]);
        }
    }
    return {kind: "Parsing error", token_id: result[1]-1, message: "expected closing parentheses"};
}

function is_let(token: Token): boolean {
    return is_tk_identifier(token) && token.value === "let";
}

function parse_let(tokens: readonly Token[], index: number = 0): Error | [NodeLet, number] {
    const start_num = index;
    index++; // consume the TK_IDENTIFIER which is equal to "let"

    if (is_tk_right(tokens[index])) return number_of_arguments_error("Parsing error", 0, 3, index);
    let result: ParseResult = parse_expression(tokens, index);
    if (is_error(result)) return result;
    const name: ASTNode = result[0];
    if (!is_nd_identifier(name))
        return { kind: "Parsing error", token_id: result[1]-1, message: "expected an identifier" };

    if (is_tk_right(tokens[result[1]])) return number_of_arguments_error("Parsing error", 1, 3, result[1]);
    result = parse_expression(tokens, result[1]);
    if (is_error(result)) return result;
    const expr = result[0];

    if (is_tk_right(tokens[result[1]])) return number_of_arguments_error("Parsing error", 2, 3, result[1]);
    result = parse_expression(tokens, result[1]);
    if (is_error(result)) return result;
    const body = result[0];

    if (!is_tk_right(tokens[result[1]])) return number_of_arguments_error("Parsing error", "too many", 3, result[1]);

    result = consumeToken(result); // consume the TokenCloseParen
    return [{ kind: "ND_LET", token_id: start_num, name: name, expr: expr, body: body }, result[1]];
}

function consumeToken(result: [ASTNode, number]): [ASTNode, number] {
    let [ast, index] = result;
    index++;
    return [ast, index];
}
