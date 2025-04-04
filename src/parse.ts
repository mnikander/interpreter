// Copyright (c) 2025 Marco Nikander
import { check_parentheses, add_whitespace_to_parentheses } from "./parentheses";

export interface Token {
    name: string,
    value?: number | string;
    symbol?: string
}

export interface TokenError extends Token {
    name: "TK_ERROR",
    value: string
}

export interface TokenNumber extends Token {
    name: "TK_NUMBER",
    value: number
}

const TK_LEFT  : Token = {name: "TK_LEFT",   symbol: "("};
const TK_RIGHT : Token = {name: "TK_RIGHT",  symbol: ")"};
const TK_ADD   : Token = {name: "TK_ADD",    symbol: "+"};

export function is_error(token: any): boolean {
    return token.name == "ERROR";
}


export function parse(line: string): Token[] {
    if (!check_parentheses(line)) {
        return [{name: "TK_ERROR", value: "ERROR: invalid parentheses"} as TokenError] as Token[];
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

export function maybe_token(word: string, token: any): Token | undefined {
    if(word == token.symbol) {
        return token;
    }
    else {
        return undefined;
    }
}

export function maybe_number(word: string): Token | undefined {
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
    return maybe_token(word, TK_LEFT) ??
            maybe_token(word, TK_RIGHT) ??
            maybe_token(word, TK_ADD) ??
            maybe_number(word) ??
            {name: "TK_ERROR", value: word} as TokenError;
}
