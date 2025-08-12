// Copyright (c) 2025 Marco Nikander

import { AST, Atom, Call, make_atom, make_call } from "./ast";
import { error, is_error, is_ok, Result } from "./error";
import { is_token, Token } from "./token";

type ParserState = { token_index: number, node_counter: number, tokens: readonly Token[]};

export function parse(tokens: readonly Token[]): Result<AST> {
    let state: ParserState = { token_index: 0, node_counter: 0, tokens: tokens};
    let parsed: { state: ParserState, result: Result<AST> } = line(state);
    return parsed.result;
}

// line = expr *space
function line(state: ParserState): { state: ParserState, result: Result<AST> } {
    let attempt_expr = expr(state);
    state = attempt_expr.state;
    state = consume_whitespace(state);
    if (state.token_index !== state.tokens.length) {
        return { state: state, result: { ok: false, error: error("Parsing", "expected a single expression at", state.token_index)}};
    }
    else {
        return { state: state, result: attempt_expr.result };
    }
}

// expr = *space (atom / call)
function expr(state: ParserState): { state: ParserState, result: Result<AST> } {
    state = consume_whitespace(state);

    const attempt_atom = atom(state);
    if (is_ok(attempt_atom.result)) return attempt_atom;
    
    const attempt_call = call(state);
    if (is_ok(attempt_call.result)) return attempt_call;
    
    return { state: state, result: { ok: false, error: error("Parsing", "an expression at", state.token_index)}};
}

// call = open *space expr *(space *space expr) *space close
function call(state: ParserState): { state: ParserState, result: Result<AST> } {
    if (state.token_index == state.tokens.length || !is_token.open(state.tokens[state.token_index])) {
        return { state: state, result: { ok: false, error: error("Parsing", "a function call, expected '('", state.token_index)}};
    }
    else {
        let call: Call = make_call(state.node_counter, state.tokens[state.token_index], []);
        state = update(state);
        state = consume_whitespace(state);
        const attempt_expr = expr(state);
        if (is_error(attempt_expr.result)) return attempt_expr;
        state = attempt_expr.state;
        call.data.push(attempt_expr.result.value);

        while (state.token_index < state.tokens.length && is_token.whitespace(state.tokens[state.token_index])) { // at least one whitespace character exists before another expr
            state = consume_whitespace(state); // consume that one whitespace character along with all further whitespaces
            const attempt_another_expr = expr(state);
            if (is_error(attempt_another_expr.result)) break;
            state = attempt_another_expr.state;
            call.data.push(attempt_another_expr.result.value);
        }
        state = consume_whitespace(state);
        
        if (state.token_index == state.tokens.length || !is_token.close(state.tokens[state.token_index])) {
            return { state: state, result: { ok: false, error: error("Parsing", "a function call, expected ')'", state.token_index)}};
        }
        state.token_index++; // consume ')'
        return { state: state, result: { ok: true, value: call } };
    }
}

// atom = boolean / number / string / identifier
function atom(state: ParserState): { state: ParserState, result: Result<AST> } {
    const token: Token = state.tokens[state.token_index];
    if(state.token_index < state.tokens.length && (is_token.boolean(token) || is_token.number(token) || is_token.string(token) || is_token.identifier(token))) {
        let atom: Atom = make_atom(state.node_counter, token);
        state = update(state);
        return { state: state, result: { ok: true, value: atom }};
    }
    return { state: state, result: { ok: false, error: error("Parsing", "an atom, expected a boolean, number, string, or identifier", state.token_index)}};
}

function consume_whitespace(state: ParserState): ParserState {
    let token_index: number = state.token_index;
    while(token_index < state.tokens.length && is_token.whitespace(state.tokens[token_index])) {
        token_index++;
    }
    return { token_index: token_index, node_counter: state.node_counter, tokens: state.tokens };
}

function update(state: ParserState): ParserState {
    return { token_index: state.token_index + 1, node_counter: state.node_counter + 1, tokens: state.tokens };
}
