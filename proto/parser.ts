// Copyright (c) 2025 Marco Nikander

import { AST, Leaf, Node, make_leaf } from "./ast";
import { error, is_error, is_ok, Result } from "./error";
import { is_token, Token } from "./token";

export function parse(tokens: readonly Token[]): Result<AST> {
    let index: number        = 0;
    let node_counter: number = 0;
    let parsed: { index: number, node_counter: number, result: Result<AST> } = line(index, node_counter, tokens);
    return parsed.result;
}

// line = expr *space
function line(index: number, node_counter: number, tokens: readonly Token[]): { index: number, node_counter: number, result: Result<AST> } {
    let attempt_expr = expr(index, node_counter, tokens);
    index = attempt_expr.index;
    node_counter = attempt_expr.node_counter;
    index = consume_whitespace(index, tokens);
    if (index !== tokens.length) {
        return { index: index, node_counter: node_counter, result: { ok: false, error: error("Parsing", "a line, expected a single expression", index)}};
    }
    else {
        return { index: index, node_counter: node_counter, result: attempt_expr.result };
    }
}

// expr = *space (atom / call)
function expr(index: number, node_counter: number, tokens: readonly Token[]): { index: number, node_counter: number, result: Result<AST> } {
    index = consume_whitespace(index, tokens);

    const attempt_atom = atom(index, node_counter, tokens);
    if (is_ok(attempt_atom.result)) return attempt_atom;
    
    const attempt_call = call(index, node_counter, tokens);
    if (is_ok(attempt_call.result)) return attempt_call;
    
    return { index: index, node_counter: node_counter, result: { ok: false, error: error("Parsing", "an expression", index)}};
}

// call = (open *space expr *(space *space expr) *space close)
function call(index: number, node_counter: number, tokens: readonly Token[]): { index: number, node_counter: number, result: Result<AST> } {
    
    if (index == tokens.length || !is_token.open(tokens[index])) {
        return { index: index, node_counter: node_counter, result: { ok: false, error: error("Parsing", "a function call, expected '('", index)}};
    }
    else {
        let node: Node     = { kind: "Node", subkind: "Call", token_id: index, node_id: node_counter, data: [] };
        index++; // consume '('
        node_counter++;
        index              = consume_whitespace(index, tokens);
        const attempt_expr = expr(index, node_counter, tokens);
        if (is_error(attempt_expr.result)) return attempt_expr;
        index          = attempt_expr.index;
        node_counter   = attempt_expr.node_counter;
        node.data.push(attempt_expr.result.value);

        while (index < tokens.length && is_token.whitespace(tokens[index])) { // at least one whitespace character exists before another expr
            index                      = consume_whitespace(index, tokens); // consume that one whitespace character along with all further whitespaces
            const attempt_another_expr = expr(index, node_counter, tokens);
            if (is_error(attempt_another_expr.result)) break;
            index        = attempt_another_expr.index;
            node_counter = attempt_another_expr.node_counter;
            node.data.push(attempt_another_expr.result.value);
        }
        index = consume_whitespace(index, tokens);
        
        if (index == tokens.length || !is_token.close(tokens[index])) {
            return { index: index, node_counter: node_counter, result: { ok: false, error: error("Parsing", "a function call, expected ')'", index)}};
        }
        index++; // consume ')'
        return { index: index, node_counter: node_counter, result: { ok: true, value: node } };
    }
}

// atom = boolean / number / string / identifier
function atom(index: number, node_counter: number, tokens: readonly Token[]): { index: number, node_counter: number, result: Result<AST> } {
    
    const token: Token = tokens[index];
    if(index < tokens.length && (is_token.boolean(token) || is_token.number(token) || is_token.string(token) || is_token.identifier(token))) {
        index++;
        let atom: Leaf = make_leaf(index, node_counter, token);
        node_counter++;
        return { index: index, node_counter: node_counter, result: { ok: true, value: atom }};
    }
        
    return { index: index, node_counter: node_counter, result: { ok: false, error: error("Parsing", "an atom, expected a boolean, a number, a string, or an identifier", index)}};
}

function consume_whitespace(index: number, tokens: readonly Token[]): number {
    while(index < tokens.length && is_token.whitespace(tokens[index])) {
        index++;
    }
    return index;
}
