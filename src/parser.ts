// Copyright (c) 2025 Marco Nikander

import { is_tk_boolean, is_tk_number, is_tk_identifier, is_tk_left, is_tk_right, Token } from "./lexer";
import { Error, is_error } from "./error";

export type ASTAtom =
    | NodeBoolean
    | NodeNumber
    | NodeIdentifier;

export type ASTNode =
    | ASTAtom
    | NodeCall;

export interface NodeBoolean    { kind: "ND_BOOLEAN",    value: boolean };
export interface NodeNumber     { kind: "ND_NUMBER",     value: number };
export interface NodeIdentifier { kind: "ND_IDENTIFIER", value: string };
export interface NodeCall       { kind: "ND_CALL",       func: ASTNode, params: ASTNode[] };

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

        if (is_tk_boolean(token)) {
            index++; // consume the TK_BOOLEAN
            return [{kind: "ND_BOOLEAN", value: token.value}, index];
        }
        else if (is_tk_number(token)) {
            index++; // consume the TK_NUMBER
            return [{kind: "ND_NUMBER", value: token.value}, index];
        }
        else if (is_tk_identifier(token)) {
            index++; // consume the TK_IDENTIFIER
            return [{kind: "ND_IDENTIFIER", value: token.value}, index];
        }
        else if (is_tk_left(token)) {
            index++; // consume the TK_LEFT
            let params: ASTNode[] = [];
            let parseResult = parse_expression(tokens, index);
            if(is_error(parseResult)) {
                return parseResult;
            }
            else {
                let [func, i] = parseResult;
                index = i;
                while (index < tokens.length) {
                    if (is_tk_right(tokens[index])) {
                        index++; // consume the TK_RIGHT
                        return [{kind: "ND_CALL", func: func, params: params}, index];
                    }
                    else {
                        let item = parse_expression(tokens, index);
                        if (is_error(item)) {
                            return item;
                        }
                        else {
                            let [node, i] = item;
                            index = i;
                            params.push(node);
                        }
                    }
                }
                return {kind: "Parsing error", message: "expected closing parentheses"};
            }
        }
        else {
            index++; // consume the unparsable token
            return {kind: "Parsing error", message: `unable to parse token of kind ${tokens[index].kind}`};
        }
    }
    else {
        return {kind: "Parsing error", message: "expected another token"};
    }
}
