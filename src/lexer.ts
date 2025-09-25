// Copyright (c) 2025 Marco Nikander

import { Item } from './item'

export type Token           = TokenBoolean | TokenNumber | TokenString | TokenIdentifier | TokenOpen | TokenClose | TokenWhitespace;
export type TokenBoolean    = { tag: 'Token', lexeme: 'BOOLEAN', id: number, offset: number, value: boolean }
export type TokenNumber     = { tag: 'Token', lexeme: 'NUMBER', id: number, offset: number, value: number }
export type TokenString     = { tag: 'Token', lexeme: 'STRING', id: number, offset: number, value: string }
export type TokenIdentifier = { tag: 'Token', lexeme: 'IDENTIFIER', id: number, offset: number, value: string }
export type TokenOpen       = { tag: 'Token', lexeme: 'OPEN', id: number, offset: number, value: '(' }
export type TokenClose      = { tag: 'Token', lexeme: 'CLOSE', id: number, offset: number, value: ')' }
export type TokenWhitespace = { tag: 'Token', lexeme: 'WHITESPACE', id: number, offset: number, value: string }

export type Lexeme = 'WHITESPACE' | 'OPEN' | 'CLOSE' | 'BOOLEAN' | 'NUMBER' | 'STRING' | 'IDENTIFIER';

const lexemes: Record<Lexeme, RegExp> = {
    'WHITESPACE': /^\s+/,
    'OPEN':       /^\(/,
    'CLOSE':      /^\)/,
    'BOOLEAN':    /^(true|false)/,
    'NUMBER':     /^[-+]?(?:\d*\.\d+|\d+\.\d*|\d+)/,
    'STRING':     /^"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/,
    'IDENTIFIER': /^(?:([_a-zA-Z][_a-zA-Z0-9]*)|([.,:;!?<>\=\@\#\$\+\-\*\/\%\&\|\^\~]+))/,
};

type Match = { lexeme: Lexeme, word: string };

interface State extends Item {
    tag: 'State',
    offset: number,
    line: string,
    tokens: Token[]
};

export function lex(line: string): Token[] {
    let state: State = { tag: 'State', offset: 0, line: line, tokens: []};
    
    while(state.offset < state.line.length) {
        const match: undefined | Match =
        check(state, 'BOOLEAN') 
        ?? check(state, 'NUMBER')
        ?? check(state, 'STRING')
        ?? check(state, 'IDENTIFIER')
        ?? check(state, 'WHITESPACE')
        ?? check(state, 'OPEN')
        ?? check(state, 'CLOSE');

        if (match) {
            if (match.lexeme === 'BOOLEAN') {
                state = push(state, make_boolean(state, match));
            }
            else if (match.lexeme === 'NUMBER') {
                state = push(state, make_number(state, match));
            }
            else if (match.lexeme === 'STRING' ) {
                state = push(state, make_string(state, match));
            }
            else if (match.lexeme === 'IDENTIFIER') {
                state = push(state, make_identifier(state, match));
            }
            else if (match.lexeme === 'OPEN') { 
                state = push(state, make_open(state, match));
            }
            else if (match.lexeme === 'CLOSE') { 
                state = push(state, make_close(state, match));
            }
            else if (match.lexeme === 'WHITESPACE') { 
                state = push(state, make_whitespace(state, match));
            }
            state.offset += match.word.length;
        }
        else {
            throw Error(`Could not lex '${state.line[state.offset]}'.`);
        }
    }
    return state.tokens;
}

function check(state: State, expected: Lexeme): undefined | Match {
    const remaining: string = state.line.slice(state.offset);
    const match = lexemes[expected].exec(remaining)
    if (match) {
        return { lexeme: expected, word: match[0] };
    }
    else {
        return undefined;
    }
}

function push(state: State, token: Token): State {
    state.tokens.push(token);
    return state;
}

function make_boolean (state: State, match: Match): TokenBoolean {
    const value = match.word !== 'false';
    return { tag: 'Token', lexeme: 'BOOLEAN', id: state.tokens.length, offset: state.offset, value: value };
}

function make_number(state: State, match: Match): TokenNumber {
    return { tag: 'Token', lexeme: 'NUMBER', id: state.tokens.length, offset: state.offset, value: Number(match.word) };
}

function make_string(state: State, match: Match): TokenString {
    return { tag: 'Token', lexeme: 'STRING', id: state.tokens.length, offset: state.offset, value: match.word };
}

function make_identifier (state: State, match: Match): TokenIdentifier {
    return { tag: 'Token', lexeme: 'IDENTIFIER', id: state.tokens.length, offset: state.offset, value: match.word };
}

function make_open(state: State, match: Match): TokenOpen {
    return { tag: 'Token', lexeme: 'OPEN', id: state.tokens.length, offset: state.offset, value: '(' };
}

function make_close(state: State, match: Match): TokenClose {
    return { tag: 'Token', lexeme: 'CLOSE', id: state.tokens.length, offset: state.offset, value: ')' };
}

function make_whitespace(state: State, match: Match): TokenWhitespace {
    return { tag: 'Token', lexeme: 'WHITESPACE', id: state.tokens.length, offset: state.offset, value: match.word };
}

export function is_token(item: Item): item is Token {
    return item.tag === 'Token';
}

export function is_token_boolean(item: Item): item is TokenBoolean {
    return is_token(item) && item.lexeme === 'BOOLEAN';
}

export function is_token_number(item: Item): item is TokenNumber {
    return is_token(item) && item.lexeme === 'NUMBER';
}

export function is_token_string(item: Item): item is TokenString {
    return is_token(item) && item.lexeme === 'STRING';
}

export function is_token_identifier(item: Item): item is TokenIdentifier {
    return is_token(item) && item.lexeme === 'IDENTIFIER';
}

export function is_token_open(item: Item): item is TokenOpen {
    return is_token(item) && item.lexeme === 'OPEN';
}

export function is_token_close(item: Item): item is TokenClose {
    return is_token(item) && item.lexeme === 'CLOSE';
}

export function is_token_whitespace(item: Item): item is TokenWhitespace {
    return is_token(item) && item.lexeme === 'WHITESPACE';
}
