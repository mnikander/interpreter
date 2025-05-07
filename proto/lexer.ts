// Copyright (c) 2025 Marco Nikander

import { make_token, Token } from './token'
import { Error, Result, is_error, is_ok } from './error'
import { Item } from './item'

const rule = {
    space:       /^\s/,
    open:        /\(/,
    close:       /\)/,
    bool:        /^(true|false)/,
    int:         /^[-+]?[0-9]+/,
    float:       /^[-+]?((\d+\.\d*)|(\d*\.\d+))/,
    string:      /^"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/,
    id_alphanum: /^[_a-zA-Z][_a-zA-Z0-9]*/,
    id_special:  /^[.,:;!?<>\=\@\#\$\+\-\*\/\%\&\|\^\~]+/,
}

interface TokenizerState extends Item {
    kind: "TokenizerState",
    success: boolean,
    index: number,
    line: string,
    tokens: Token[]
};

// handles errors and implements the production rule:
//      line ::= expr *space
export function lex(line: string): Result<Token[]> {
    let state: TokenizerState = { kind: "TokenizerState", success: true, index: 0, line: line, tokens: []};
    let result: Result<TokenizerState> = lex_expression(state);
    if (is_error(result)) {
        return result;
    }
    else {
        result.value = remove_whitespace(result.value);
        if(result.value.line.length == 0) {
            return { ok: true, value: result.value.tokens };
        }
        else {
            return { ok: false, error: { kind: "Error", subkind: "Lexing", token_id: result.value.tokens.length, message: "expected a single expression"}};
        }
    }
}

export function lex_expression(state: TokenizerState): Result<TokenizerState> {
    // currently this function implements the production rule:
    //      expr ::= *space (atom | (open *(*space expr)))
    //
    // which is not quite correct, inside a function call there MUST be at least one expression, and if there are several then those must be separated by at least one space
    //      expr ::= *space (atom | (open *space expr *(space *space expr)))
    //                                           ^      ^
    state = remove_whitespace(state);

    const atom: Result<TokenizerState> = try_atom(state);
    if (is_ok(atom)) {
        return atom;
    }
    else {
        let function_call = try_token(rule.open, make_token.open, state);
        if (is_error(function_call)) return function_call;

        while(is_ok(function_call)) {
            const closeParen = try_token(rule.close, make_token.close, function_call.value);
            if (is_ok(closeParen)) {
                // TODO: I need to ensure there is at least one atom
                return closeParen;
            }
            else {
                // TODO: I need to ensure that when there are spaces between atoms
                function_call = lex_expression(function_call.value);
            }
        }
        return function_call;
    }
}

function remove_whitespace(state: TokenizerState): TokenizerState {
    let result: Result<TokenizerState> = { ok: true, value: state };
    while (is_ok(result)) {
        state  = result.value; // update state only if the previous result was ok
        result = try_token(rule.space, undefined, result.value);
    }
    return state; // return the last successful state
}

function try_space(state: TokenizerState): Result<TokenizerState> {
    return try_token(rule.space, undefined, state);
}

function try_atom(state: TokenizerState): Result<TokenizerState> {
    let result: Result<TokenizerState> = { ok: true, value: state };

    result = try_token(rule.bool, make_token.boolean, state);
    if (is_ok(result)) return result;

    result = try_token(rule.int, make_token.number, state);
    if (is_ok(result)) return result;

    result = try_token(rule.float, make_token.number, state);
    if (is_ok(result)) return result;

    result = try_token(rule.string, make_token.string, state);
    if (is_ok(result)) return result;

    result = try_token(rule.id_alphanum, make_token.identifier, state);
    if (is_ok(result)) return result;

    result = try_token(rule.id_special, make_token.identifier, state);
    if (is_ok(result)) return result;

    return result;
}

function try_token(regex: RegExp, make_token: undefined | Function, state: TokenizerState): Result<TokenizerState> {
    const match = regex.exec(state.line);
    if (match && match.index === 0) { // verify the match starts at the beginning
        const word = match[0];
        state.success = true;
        state.index += word.length;
        state.line = state.line.slice(word.length);
        if (make_token !== undefined) {
            state.tokens.push(make_token(state.index, word)); // TODO: it might be possible to construct a raw AST by appending into a data field here, instead of into a flat list of tokens
        }
        return { ok: true, value: state };
    }
    else {
        return { ok: false, error: { kind: "Error", subkind: "Lexing", token_id: state.tokens.length, message: `could not match token ${regex}`} };
    }
}
