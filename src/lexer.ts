// Copyright (c) 2025 Marco Nikander

import { make_token, Token } from './token'
import { Result, is_ok, pass, fail } from './error'
import { Item } from './item'

const rule = {
    whitespace:  { description: "one or more whitespace characters", regex: /^\s+/},
    open:        { description: "(",                                 regex: /\(/},
    close:       { description: ")",                                 regex: /\)/},
    bool:        { description: "a boolean",                         regex: /^(true|false)/},
    int:         { description: "an integer",                        regex: /^[-+]?[0-9]+/},
    float:       { description: "a float",                           regex: /^[-+]?((\d+\.\d*)|(\d*\.\d+))/},
    string:      { description: "a string",                          regex: /^"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/},
    id_alphanum: { description: "an alphanumeric identifier",        regex: /^[_a-zA-Z][_a-zA-Z0-9]*/},
    id_special:  { description: "an operation identifier",           regex: /^[.,:;!?<>\=\@\#\$\+\-\*\/\%\&\|\^\~]+/},
};

interface State extends Item {
    kind: "State",
    offset: number,
    line: string,
    tokens: Token[]
};

export function lex(line: string): Result<Token[]> {
    let result: Result<State> = { ok: true, value: { kind: "State", offset: 0, line: line, tokens: []}};
    while(is_ok(result)) {
        if (result.value.line.length > 0) {
            result = next_token(result.value);
        }
        else {
            return pass(result.value.tokens);
        }
    }
    return result;
}

function next_token(state: State): Result<State> {
    let result: Result<State> = { ok: true, value: state };

    result = try_token(rule.whitespace, make_token.whitespace, state);
    if (is_ok(result)) return result;

    result = try_token(rule.open, make_token.open, state);
    if (is_ok(result)) return result;

    result = try_token(rule.close, make_token.close, state);
    if (is_ok(result)) return result;

    result = try_token(rule.bool, make_token.boolean, state);
    if (is_ok(result)) return result;

    result = try_token(rule.float, make_token.number, state);
    if (is_ok(result)) return result;

    result = try_token(rule.int, make_token.number, state);
    if (is_ok(result)) return result;

    result = try_token(rule.string, make_token.string, state);
    if (is_ok(result)) return result;

    result = try_token(rule.id_alphanum, make_token.identifier, state);
    if (is_ok(result)) return result;

    result = try_token(rule.id_special, make_token.identifier, state);
    if (is_ok(result)) return result;

    return fail("Lexing", "invalid token, expected an atom", state.tokens.length);
}

function try_token(rule: { description: string, regex: RegExp }, make_token: undefined | Function, state: State): Result<State> {
    const match = rule.regex.exec(state.line);
    if (match && match.index === 0) { // verify the match starts at the beginning
        const word = match[0];
        state.offset += word.length;
        state.line = state.line.slice(word.length);
        if (make_token !== undefined) {
            state.tokens.push(make_token(state.tokens.length, state.offset, word)); // TODO: it might be possible to construct a raw AST by appending into a data field here, instead of into a flat list of tokens
        }
        return pass(state);
    }
    else {
        return fail("Lexing", `invalid token, expected ${rule.description}`, state.tokens.length);
    }
}
