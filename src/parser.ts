// Copyright (c) 2025 Marco Nikander

import { AST, Leaf, Call, make_leaf, make_call } from "./ast";
import { error, is_error, is_ok, Result } from "./error";
import { is_token, Token } from "./token";

export function parse(tokens: readonly Token[]): Result<AST> {
    let index: number        = 0;
    let node_counter: number = 0;
    let parsed: { index: number, node_counter: number, result: Result<AST> } = line(index, node_counter, tokens);
    return parsed.result;
}

// line = expr *space
function line(token_index: number, node_counter: number, tokens: readonly Token[]): { index: number, node_counter: number, result: Result<AST> } {
    let attempt_expr = expr(token_index, node_counter, tokens);
    token_index      = attempt_expr.index;
    node_counter     = attempt_expr.node_counter;
    token_index      = consume_whitespace(token_index, tokens);
    if (token_index !== tokens.length) {
        return { index: token_index, node_counter: node_counter, result: { ok: false, error: error("Parsing", "expected a single expression at", token_index)}};
    }
    else {
        return { index: token_index, node_counter: node_counter, result: attempt_expr.result };
    }
}

// expr = *space (atom / call)
function expr(token_index: number, node_counter: number, tokens: readonly Token[]): { index: number, node_counter: number, result: Result<AST> } {
    token_index = consume_whitespace(token_index, tokens);

    const attempt_atom = atom(token_index, node_counter, tokens);
    if (is_ok(attempt_atom.result)) return attempt_atom;
    
    const attempt_call = call(token_index, node_counter, tokens);
    if (is_ok(attempt_call.result)) return attempt_call;
    
    return { index: token_index, node_counter: node_counter, result: { ok: false, error: error("Parsing", "an expression at", token_index)}};
}

// call = (open *space expr *(space *space expr) *space close)
function call(token_index: number, node_counter: number, tokens: readonly Token[]): { index: number, node_counter: number, result: Result<AST> } {
    if (token_index == tokens.length || !is_token.open(tokens[token_index])) {
        return { index: token_index, node_counter: node_counter, result: { ok: false, error: error("Parsing", "a function call, expected '('", token_index)}};
    }
    else {
        let call: Call     = make_call(node_counter, tokens[token_index], []);
        node_counter++;
        token_index++; // consume '('
        token_index              = consume_whitespace(token_index, tokens);
        const attempt_expr = expr(token_index, node_counter, tokens);
        if (is_error(attempt_expr.result)) return attempt_expr;
        token_index          = attempt_expr.index;
        node_counter   = attempt_expr.node_counter;
        call.data.push(attempt_expr.result.value);

        while (token_index < tokens.length && is_token.whitespace(tokens[token_index])) { // at least one whitespace character exists before another expr
            token_index                      = consume_whitespace(token_index, tokens); // consume that one whitespace character along with all further whitespaces
            const attempt_another_expr = expr(token_index, node_counter, tokens);
            if (is_error(attempt_another_expr.result)) break;
            token_index        = attempt_another_expr.index;
            node_counter = attempt_another_expr.node_counter;
            call.data.push(attempt_another_expr.result.value);
        }
        token_index = consume_whitespace(token_index, tokens);
        
        if (token_index == tokens.length || !is_token.close(tokens[token_index])) {
            return { index: token_index, node_counter: node_counter, result: { ok: false, error: error("Parsing", "a function call, expected ')'", token_index)}};
        }
        token_index++; // consume ')'
        return { index: token_index, node_counter: node_counter, result: { ok: true, value: call } };
    }
}

// atom = boolean / number / string / identifier
function atom(token_index: number, node_counter: number, tokens: readonly Token[]): { index: number, node_counter: number, result: Result<AST> } {
    const token: Token = tokens[token_index];
    if(token_index < tokens.length && (is_token.boolean(token) || is_token.number(token) || is_token.string(token) || is_token.identifier(token))) {
        token_index++;
        let atom: Leaf = make_leaf(node_counter, token);
        node_counter++;
        return { index: token_index, node_counter: node_counter, result: { ok: true, value: atom }};
    }
        
    return { index: token_index, node_counter: node_counter, result: { ok: false, error: error("Parsing", "an atom, expected a boolean, number, string, or identifier", token_index)}};
}

function consume_whitespace(token_index: number, tokens: readonly Token[]): number {
    while(token_index < tokens.length && is_token.whitespace(tokens[token_index])) {
        token_index++;
    }
    return token_index;
}
