// Copyright (c) 2025 Marco Nikander
import { check_parentheses, add_whitespace_to_parentheses } from "./parentheses";

export interface Token {
    name: string,
    value?: number | string;
}

export interface TokenError extends Token {
    name: "TK_ERROR",
    value: string
}

export interface TokenNumber extends Token {
    name: "TK_NUMBER",
    value: number
}

type TokenTerminal = TokenLeft | TokenRight | TokenAdd;

export interface TokenAdd extends Token {
    name: "TK_ADD",
}

export interface TokenLeft extends Token {
    name: "TK_LEFT",
}

export interface TokenRight extends Token {
    name: "TK_RIGHT",
}

export function tokenize(line: string): Token[] {
    if (!check_parentheses(line)) {
        return [{name: "TK_ERROR", value: "invalid parentheses"} as TokenError] as Token[];
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

export function maybe_terminal_token(word: string): undefined | TokenTerminal {
    if (word == "(") {
        return {name: "TK_LEFT"} as TokenLeft;
    }
    else if (word == ")") {
        return {name: "TK_RIGHT"} as TokenRight;
    }
    else if (word == "+") {
        return {name: "TK_ADD"} as TokenAdd;
    }
    return undefined;
}

export function maybe_number_token(word: string): undefined | TokenNumber {
    if (word == '' || word[0] == ' ') {
        // TODO: this block should not be necessary
        return undefined;
    }
    else {
        let number = Number(word);
        if (isNaN(number)) {
            return undefined;
        }
        else {
            return {name: "TK_NUMBER", value: number} as TokenNumber;
        }
    }
}

export function to_token(word: string): Token {
    
    return maybe_terminal_token(word) ??
            maybe_number_token(word) ??
            {name: "TK_ERROR", value: word} as TokenError;
}

export function is_error(token: any): boolean {
    return token.name == "TK_ERROR";
}
