// Copyright (c) 2025 Marco Nikander
import { check_parentheses, add_whitespace_to_parentheses } from "./parentheses";

export interface Token {
    kind: string,
    value?: number | string;
}

export interface TokenError extends Token {
    kind: "TK_ERROR",
    value: string
}

export interface TokenNumber extends Token {
    kind: "TK_NUMBER",
    value: number
}

export interface TokenIdentifier extends Token {
    kind: "TK_IDENTIFIER",
    value: string
}

export interface TokenLeft extends Token {
    kind: "TK_LEFT",
}

export interface TokenRight extends Token {
    kind: "TK_RIGHT",
}

export function is_tk_error(token: Token): boolean {
    return token.kind == "TK_ERROR";
}

export function is_tk_number(token: Token): boolean {
    return token.kind == "TK_NUMBER";
}

export function is_tk_identifier(token: Token): boolean {
    return token.kind == "TK_IDENTIFIER";
}

export function is_tk_left(token: Token): boolean {
    return token.kind == "TK_LEFT";
}

export function is_tk_right(token: Token): boolean {
    return token.kind == "TK_RIGHT";
}

export function tokenize(line: string): Token[] {
    if (!check_parentheses(line)) {
        return [{kind: "TK_ERROR", value: "invalid parentheses"} as TokenError] as Token[];
    }
    let spaced   = add_whitespace_to_parentheses(line);
    let words    = spaced.split(" ");
    words        = remove_empty_words(words);
    const tokens = words.map(to_token);
    return tokens;
}

export function remove_empty_words(words: string[]): string[] {
    let result = [];
    for (let word of words) {
        if (word != "") {
            result.push(word);
        }
    }
    return result;
}

export function to_token(word: string): Token {
    return maybe_parenthesis_token(word) ??
            maybe_number_token(word) ??
            maybe_identifier_token(word) ??
            {kind: "TK_ERROR", value: `invalid character ${word}`} as TokenError;
}

export function maybe_parenthesis_token(word: string): undefined | TokenLeft | TokenRight {
    if (word == "(") {
        return {kind: "TK_LEFT"} as TokenLeft;
    }
    else if (word == ")") {
        return {kind: "TK_RIGHT"} as TokenRight;
    }
    return undefined;
}

export function maybe_number_token(word: string): undefined | TokenNumber {
    let number = Number(word);
    if (isNaN(number)) {
        return undefined;
    }
    else {
        return {kind: "TK_NUMBER", value: number} as TokenNumber;
    }
}

export function maybe_identifier_token(word: string): undefined | TokenIdentifier {
    if (/^[_a-zA-Z][_a-zA-Z0-9]*$/.test(word)) {
        return {kind: "TK_IDENTIFIER", value: word} as TokenIdentifier;
    }
    else if (/^[.,:;!?<>\=\@\#\$\+\-\*\/\%\&\|\^\~]+$/.test(word)) {
        return {kind: "TK_IDENTIFIER", value: word} as TokenIdentifier;
    }
    return undefined;
}
