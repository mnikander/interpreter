// Copyright (c) 2025 Marco Nikander

import { is_tk_boolean, is_tk_number, is_tk_identifier, is_tk_left, is_tk_right, Token } from "./lexer";

export type ASTAtom =
    | { kind: "ND_BOOLEAN", value: boolean }
    | { kind: "ND_NUMBER", value: number }
    | { kind: "ND_IDENTIFIER", value: string };

export type ASTNode =
    | ASTAtom
    | { kind: "ND_CALL", func: ASTNode, params: ASTNode[] }
    | { kind: "ND_ERROR", value: string };

export function is_nd_boolean(node: ASTNode): boolean {
    return node.kind == "ND_BOOLEAN";
}

export function is_nd_number(node: ASTNode): boolean {
    return node.kind == "ND_NUMBER";
}

export function is_nd_identifier(node: ASTNode): boolean {
    return node.kind == "ND_IDENTIFIER";
}

export function is_nd_call(node: ASTNode): boolean {
    return node.kind == "ND_CALL";
}

export function is_nd_error(node: ASTNode): boolean {
    return node.kind == "ND_ERROR";
}

export function parse(tokens: Token[]): [ASTNode, number] {
    let [expression, index] = parse_expression(tokens, 0);
    if (index == tokens.length) {
        return [expression, index];
    }
    else if (index < tokens.length) {
        return [{kind: "ND_ERROR", value: "expected a single expression"}, index];
    }
    else {
        return [{kind: "ND_ERROR", value: "not all tokens could be evaluated"}, index];
    }
}

export function parse_expression(tokens: readonly Token[], index: number = 0): [ASTNode, number] {
    if (index < tokens.length) {
        let token: Token = tokens[index];

        if (is_tk_boolean(token)) {
            index++; // consume the TK_BOOLEAN
            const v: boolean = token.value as boolean;
            return [{kind: "ND_BOOLEAN", value: v}, index];
        }
        else if (is_tk_number(token)) {
            index++; // consume the TK_NUMBER
            const v: number = token.value as number;
            return [{kind: "ND_NUMBER", value: v}, index];
        }
        else if (is_tk_identifier(token)) {
            index++; // consume the TK_IDENTIFIER
            const v: string = token.value as string;
            return [{kind: "ND_IDENTIFIER", value: v}, index];
        }
        else if (is_tk_left(token)) {
            index++; // consume the TK_LEFT
            let func: ASTNode = {kind: "ND_ERROR", value: "could not parse function"};
            let params: ASTNode[] = [];
            [func, index] = parse_expression(tokens, index);

            while (index < tokens.length) {
                if (is_tk_right(tokens[index])) {
                    index++; // consume the TK_RIGHT
                    return [{kind: "ND_CALL", func: func, params: params}, index];
                }
                else {
                    let node: ASTNode = {kind: "ND_ERROR", value: "could not parse expression"};
                    [node, index] = parse_expression(tokens, index);
                    params.push(node);
                }
            }
            return [{kind: "ND_ERROR", value: "expected closing parentheses"}, index];
        }
        else {
            index++; // consume the unparsable token
            return [{kind: "ND_ERROR", value: `unable to parse token of kind ${tokens[index].kind}`}, index];
        }
    }
    else {
        return [{kind: "ND_ERROR", value: "expected another token"}, index];
    }
}

export function check_for_errors(ast: ASTNode): undefined | string {
    if (ast.kind == "ND_ERROR") {
        return ast.value; // found an error
    }
    else if (ast.kind == "ND_CALL") {
        const error_message = check_for_errors(ast.func);
        if (error_message !== undefined) {
            return error_message; // function is not ok
        }
        else { // func is ok, check params
            for (let arg of ast.params) {
                const arg_error_message = check_for_errors(arg);
                if (arg_error_message !== undefined) {
                    return arg_error_message; // a parameter is not ok
                }
            }
            return undefined; // all params are ok
        }
    }
    else {
        return undefined; // everything is ok
    }
}
