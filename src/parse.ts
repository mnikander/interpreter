// Copyright (c) 2025 Marco Nikander
import { check_parentheses, add_whitespace_to_parentheses } from "./parentheses";

export interface Token {
    name: string,
    value?: number | string;
    terminal?: string
}

export interface TokenError extends Token {
    name: "TK_ERROR",
    value: string
}

export interface TokenNumber extends Token {
    name: "TK_NUMBER",
    value: number
}

const terminal_tokens: Token[] = [
    {name: "TK_LEFT" , terminal: "("},
    {name: "TK_RIGHT", terminal: ")"},
    {name: "TK_ADD"  , terminal: "+"},
];

export function parse(line: string): Token[] {
    if (!check_parentheses(line)) {
        return [{name: "TK_ERROR", value: "invalid parentheses"} as TokenError] as Token[];
    }
    let spaced   = add_whitespace_to_parentheses(line);
    let words    = spaced.split(" ");
    words        = remove_empty_words(words);
    const tokens = words.map(tokenize);
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

export function maybe_terminal_token(word: string): Token | undefined {
    for (const token of terminal_tokens) {
        if(word == token.terminal) {
            return {name: token.name, terminal: token.terminal} as Token;
        }
    }
    return undefined;
}

export function maybe_number_token(word: string): Token | undefined {
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

export function tokenize(word: string): Token {
    return maybe_terminal_token(word) ??
            maybe_number_token(word) ??
            {name: "TK_ERROR", value: word} as TokenError;
}

export function is_error(token: any): boolean {
    return token.name == "TK_ERROR";
}
