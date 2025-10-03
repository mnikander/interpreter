// Copyright (c) 2025 Marco Nikander

import { Item } from './item'

export type Token           = TokenBoolean | TokenNumber | TokenString | TokenIdentifier | TokenLambda | TokenLet | TokenIf | TokenOpen | TokenClose | TokenWhitespace | TokenEOF;
export type TokenBoolean    = { tag: 'Token', lexeme: 'BOOLEAN', id: number, offset: number, value: boolean };
export type TokenNumber     = { tag: 'Token', lexeme: 'NUMBER', id: number, offset: number, value: number };
export type TokenString     = { tag: 'Token', lexeme: 'STRING', id: number, offset: number, value: string };
export type TokenIdentifier = { tag: 'Token', lexeme: 'IDENTIFIER', id: number, offset: number, value: string };
export type TokenLambda     = { tag: 'Token', lexeme: 'LAMBDA', id: number, offset: number, value: 'lambda' };
export type TokenLet        = { tag: 'Token', lexeme: 'LET', id: number, offset: number, value: 'let' };
export type TokenIf         = { tag: 'Token', lexeme: 'IF', id: number, offset: number, value: 'if' };
export type TokenOpen       = { tag: 'Token', lexeme: 'OPEN', id: number, offset: number, value: '(' };
export type TokenClose      = { tag: 'Token', lexeme: 'CLOSE', id: number, offset: number, value: ')' };
export type TokenWhitespace = { tag: 'Token', lexeme: 'WHITESPACE', id: number, offset: number, value: string };
export type TokenEOF        = { tag: 'Token', lexeme: 'EOF', id: number, offset: number, value: 'EOF' };
export type Lexeme          = 'BOOLEAN' | 'NUMBER' | 'STRING' | 'IDENTIFIER' | 'LAMBDA' | 'LET' | 'IF' | 'WHITESPACE' | 'OPEN' | 'CLOSE';

const lexemes: Record<Lexeme, RegExp> = {
    'BOOLEAN':    /^(true|false)/,
    'NUMBER':     /^[-+]?(?:\d*\.\d+|\d+\.\d*|\d+)/,
    'STRING':     /^"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/,
    'IDENTIFIER': /^(?:([_a-zA-Z][_a-zA-Z0-9]*)|([.,:;!?<>\=\@\#\$\+\-\*\/\%\&\|\^\~]+))/,
    'LAMBDA':     /^lambda/,
    'LET':        /^let/,
    'IF':         /^if/,
    'WHITESPACE': /^\s+/,
    'OPEN':       /^\(/,
    'CLOSE':      /^\)/,
};

export function lex(line: string): Token[] {
    let state: State = { tag: 'State', offset: 0, line: line, tokens: []};
    
    while(state.offset < state.line.length) {
        const match: undefined | Match =
        check(state, 'BOOLEAN') 
        ?? check(state, 'NUMBER')
        ?? check(state, 'STRING')
        ?? check(state, 'LAMBDA')
        ?? check(state, 'LET')
        ?? check(state, 'IF')
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
            else if (match.lexeme === 'LAMBDA') {
                state = push(state, make_lambda(state, match));
            }
            else if (match.lexeme === 'LET') {
                state = push(state, make_let(state, match));
            }
            else if (match.lexeme === 'IF') {
                state = push(state, make_if(state, match));
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
    state = push(state, make_eof(state));
    return state.tokens;
}

interface State extends Item {
    tag: 'State',
    offset: number,
    line: string,
    tokens: Token[]
};

type Match = { lexeme: Lexeme, word: string };

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

// constructors
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

function make_lambda (state: State, match: Match): TokenLambda {
    return { tag: 'Token', lexeme: 'LAMBDA', id: state.tokens.length, offset: state.offset, value: 'lambda' };
}

function make_let (state: State, match: Match): TokenLet {
    return { tag: 'Token', lexeme: 'LET', id: state.tokens.length, offset: state.offset, value: 'let' };
}

function make_if (state: State, match: Match): TokenIf {
    return { tag: 'Token', lexeme: 'IF', id: state.tokens.length, offset: state.offset, value: 'if' };
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

function make_eof(state: State): TokenEOF {
    // note that 'offset' is out-of-bounds, since, EOF is after the end of the input string
    return { tag: 'Token', lexeme: 'EOF', id: state.tokens.length, offset: state.offset, value: 'EOF' }; 
}

// type predicates
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

export function is_token_lambda(item: Item): item is TokenLambda {
    return is_token(item) && item.lexeme === 'LAMBDA';
}

export function is_token_let(item: Item): item is TokenLet {
    return is_token(item) && item.lexeme === 'LET';
}

export function is_token_if(item: Item): item is TokenIf {
    return is_token(item) && item.lexeme === 'IF';
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

export function is_token_eof(item: Item): item is TokenEOF {
    return is_token(item) && item.lexeme === 'EOF';
}
