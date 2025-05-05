// Copyright (c) 2025 Marco Nikander
import { check_parentheses, add_whitespace_to_parentheses } from "./parentheses";
import { Error, is_error } from "./error";

export type Token = 
    | TokenBoolean
    | TokenNumber
    | TokenIdentifier
    | TokenOpenParen
    | TokenCloseParen

export interface TokenBoolean    { kind: "TokenBoolean",    value: boolean };
export interface TokenNumber     { kind: "TokenNumber",     value: number };
export interface TokenIdentifier { kind: "TokenIdentifier", value: string };
export interface TokenOpenParen  { kind: "TokenOpenParen",  value: "(" };
export interface TokenCloseParen { kind: "TokenCloseParen", value: ")" };

export function is_tk_boolean(token: Token): token is TokenBoolean {
    return token.kind == "TokenBoolean";
}

export function is_tk_number(token: Token): token is TokenNumber {
    return token.kind == "TokenNumber";
}

export function is_tk_identifier(token: Token): token is TokenIdentifier {
    return token.kind == "TokenIdentifier";
}

export function is_tk_left(token: Token): token is TokenOpenParen {
    return token.kind == "TokenOpenParen";
}

export function is_tk_right(token: Token): token is TokenCloseParen {
    return token.kind === "TokenCloseParen";
}

export function tokenize(line: string): Error | Token[] {
    if (!check_parentheses(line)) {
        return { kind: "Lexing error", message: "invalid parentheses"};
    }
    let spaced   = add_whitespace_to_parentheses(line);
    let words    = spaced.split(" ");
    words        = remove_empty_words(words);
    const tokens_or_errors = words.map(to_token);

    for (const item of tokens_or_errors) {
        if (is_error(item)) {
            return item;
        }
    }

    const tokens = tokens_or_errors as Token[];
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

export function to_token(word: string): Error | Token {
    let result = maybe_parenthesis_token(word) ??
                maybe_boolean_token(word) ??
                maybe_number_token(word) ??
                maybe_identifier_token(word);
    if (result === undefined) {
        return {kind: "Lexing error", message: `invalid sequence of characters '${word}'`};
    }
    else {
        return result;
    }
}

export function maybe_parenthesis_token(word: string): undefined | Token {
    if (word == "(") {
        return {kind: "TokenOpenParen", value: "("};
    }
    else if (word == ")") {
        return {kind: "TokenCloseParen", value: ")"};
    }
    return undefined;
}

export function maybe_boolean_token(word: string): undefined | Token {
    if (word === 'True') {
        return {kind: "TokenBoolean", value: true};
    }
    else if (word === 'False') {
        return {kind: "TokenBoolean", value: false};
    }
    else {
        return undefined;
    }
}

export function maybe_number_token(word: string): undefined | Token {
    let number = Number(word);
    if (isNaN(number)) {
        return undefined;
    }
    else {
        return {kind: "TokenNumber", value: number};
    }
}

export function maybe_identifier_token(word: string): undefined | Token {
    if (/^[_a-zA-Z][_a-zA-Z0-9]*$/.test(word)) {
        return {kind: "TokenIdentifier", value: word};
    }
    else if (/^[.,:;!?<>\=\@\#\$\+\-\*\/\%\&\|\^\~]+$/.test(word)) {
        return {kind: "TokenIdentifier", value: word};
    }
    return undefined;
}
