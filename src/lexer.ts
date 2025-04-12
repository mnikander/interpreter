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

type TokenTerminal = TokenLeft | TokenRight | TokenAdd;

export interface TokenAdd extends Token {
    kind: "TK_ADD",
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

export function is_tk_left(token: Token): boolean {
    return token.kind == "TK_LEFT";
}

export function is_tk_right(token: Token): boolean {
    return token.kind == "TK_RIGHT";
}

export function is_tk_add(token: Token): boolean {
    return token.kind == "TK_ADD";
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
    return maybe_function_token(word) ??
            maybe_number_token(word) ??
            {kind: "TK_ERROR", value: `invalid character ${word}`} as TokenError;
}

export function maybe_function_token(word: string): undefined | TokenTerminal {
    if (word == "(") {
        return {kind: "TK_LEFT"} as TokenLeft;
    }
    else if (word == ")") {
        return {kind: "TK_RIGHT"} as TokenRight;
    }
    else if (word == "+") {
        return {kind: "TK_ADD"} as TokenAdd;
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
