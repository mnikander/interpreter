// Copyright (c) 2025 Marco Nikander

import { Item } from "./item";
import { Error } from "./error";

export interface Token extends Item {
    kind: "Token",
    subkind: string,
    id: number,
    value: boolean | number | string | "(" | ")",
}

export interface TokenOpen extends Token {
    kind: "Token",
    subkind: "Open",
    id: number,
    value: "(",
}

export interface TokenClose extends Token {
    kind: "Token",
    subkind: "Close",
    id: number,
    value: ")",
}

export interface TokenBoolean extends Token {
    kind: "Token",
    subkind: "Boolean",
    id: number,
    value: boolean,
}

export interface TokenNumber extends Token {
    kind: "Token",
    subkind: "Number",
    id: number,
    value: number,
}

export interface TokenString extends Token {
    kind: "Token",
    subkind: "String",
    id: number,
    value: string,
}

export interface TokenIdentifier extends Token {
    kind: "Token",
    subkind: "Identifier",
    id: number,
    value: string,
}

export const make_token = {
    open: function (id: number, word: string): TokenOpen {
       return { kind: "Token", subkind: "Open", id: id, value: "(" };
    },
    close: function (id: number, word: string): TokenClose {
        return { kind: "Token", subkind: "Close", id: id, value: ")" };
    },
    boolean: function (id: number, word: "true" | "True" | "false" | "False"): TokenBoolean {
        if (word === "false" || word === "False") {
            return { kind: "Token", subkind: "Boolean", id: id, value: false };
        }
        else {
            return { kind: "Token", subkind: "Boolean", id: id, value: true };
        }
    },
    number: function (id: number, word: string): TokenNumber {
        return { kind: "Token", subkind: "Number", id: id, value: Number(word) };
    },
    string: function (id: number, word: string): TokenString {
        return { kind: "Token", subkind: "String", id: id, value: word };
    },
    identifier: function (id: number, word: string): TokenIdentifier {
        return { kind: "Token", subkind: "Identifier", id: id, value: word };
    },
}

// type predicates

export function is_token(item: Item): item is Token {
    return item.kind === "Token";
}

export function is_token_open(item: Item): item is TokenOpen {
    return is_token(item) && item.subkind === "Open";
}

export function is_token_close(item: Item): item is TokenClose {
    return is_token(item) && item.subkind === "Close";
}

export function is_token_boolean(item: Item): item is TokenBoolean {
    return is_token(item) && item.subkind === "Boolean";
}

export function is_token_number(item: Item): item is TokenNumber {
    return is_token(item) && item.subkind === "Number";
}

export function is_token_string(item: Item): item is TokenString {
    return is_token(item) && item.subkind === "String";
}

export function is_token_identifier(item: Item): item is TokenIdentifier {
    return is_token(item) && item.subkind === "Identifier";
}
