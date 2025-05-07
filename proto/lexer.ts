// Copyright (c) 2025 Marco Nikander

import { make_token, Token } from './token'
import { Error, is_error } from './error'
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
    subkind: "None",
    success: boolean,
    index: number,
    line: string,
    tokens: Token[]
};

export function lex(line: string): Error | Token[] {
    let state: TokenizerState = { kind: "TokenizerState", subkind: "None", success: true, index: 0, line: line, tokens: []};
    let result: Error | TokenizerState = tokenize(state);
    if (is_error(result)) {
        return result;
    }
    else {
        result = remove_whitespace(result);
        if(result.line.length == 0) {
            return result.tokens;
        }
        else {
            return { kind: "Error", subkind: "Lexing", token_id: result.tokens.length, message: "expected a single expression"}
        }
    }
}

export function tokenize(state: TokenizerState): Error | TokenizerState {
    state = remove_whitespace(state);

    const atom: undefined | TokenizerState = try_atom(state);
    if (atom !== undefined) {
        state = atom;
    }
    else {
        const openParen = try_token(rule.open, make_token.open, state);
        if (openParen === undefined) return { kind: "Error", subkind: "Lexing", token_id: state.tokens.length, message: `expected a '('`};

        let result: Error | TokenizerState = openParen;
        while(!is_error(result)) {
            const closeParen = try_token(rule.close, make_token.close, result);
            if (closeParen !== undefined) {
                return closeParen;
            }
            else {
                result = tokenize(result);
            }
        }
        return result;
    }
    return state;
}

function remove_whitespace(state: TokenizerState): TokenizerState {
    let result: undefined | TokenizerState = state;
    while (result !== undefined) {
        state  = result; // update state only if the previous result was ok
        result = try_token(rule.space, undefined, result);
    }
    return state;
}

function try_atom(state: TokenizerState): undefined | TokenizerState {
    let result: undefined | TokenizerState = state;
    return try_token(rule.bool, make_token.boolean, result) ??
        try_token(rule.int, make_token.number, result) ??
        try_token(rule.float, make_token.number, result) ??
        try_token(rule.string, make_token.string, result) ??
        try_token(rule.id_alphanum, make_token.identifier, result) ??
        try_token(rule.id_special, make_token.identifier, result);
}

function try_token(regex: RegExp, make_token: undefined | Function, state: TokenizerState): undefined | TokenizerState {
    const match = regex.exec(state.line);
    if (match && match.index === 0) { // verify the match starts at the beginning
        const word = match[0];
        state.success = true;
        state.index += word.length;
        state.line = state.line.slice(word.length);
        if (make_token !== undefined) {
            state.tokens.push(make_token(state.index, word));
        }
        return state;
    }
    else {
        return undefined;
    }
}
