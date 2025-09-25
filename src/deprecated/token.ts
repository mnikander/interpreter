// Copyright (c) 2025 Marco Nikander

import { Item } from "../item";

export type Token =
    | TokenWhitespace
    | TokenOpen
    | TokenClose
    | TokenBoolean
    | TokenNumber
    | TokenString
    | TokenIdentifier;

export interface TokenWhitespace {
    kind: "Token",
    subkind: "Whitespace",
    id: number,
    offset: number,
    value: string,
}

export interface TokenOpen {
    kind: "Token",
    subkind: "Open      ",
    id: number,
    offset: number,
    value: "(",
}

export interface TokenClose {
    kind: "Token",
    subkind: "Close     ",
    id: number,
    offset: number,
    value: ")",
}

export interface TokenBoolean {
    kind: "Token",
    subkind: "Boolean   ",
    id: number,
    offset: number,
    value: boolean,
}

export interface TokenNumber {
    kind: "Token",
    subkind: "Number    ",
    id: number,
    offset: number,
    value: number,
}

export interface TokenString {
    kind: "Token",
    subkind: "String    ",
    id: number,
    offset: number,
    value: string,
}

export interface TokenIdentifier {
    kind: "Token",
    subkind: "Identifier",
    id: number,
    offset: number,
    value: string,
}

// token construction

export const make_token = {
    whitespace: function (id: number, offset: number, word: string): TokenWhitespace {
        return { kind: "Token", subkind: "Whitespace", id: id, offset: offset, value: word };
    },

    open: function (id: number, offset: number, word: string): TokenOpen {
       return { kind: "Token", subkind: "Open      ", id: id, offset: offset, value: "(" };
    },

    close: function (id: number, offset: number, word: string): TokenClose {
        return { kind: "Token", subkind: "Close     ", id: id, offset: offset, value: ")" };
    },

    boolean: function (id: number, offset: number, word: "true" | "True" | "false" | "False"): TokenBoolean {
        if (word === "false" || word === "False") {
            return { kind: "Token", subkind: "Boolean   ", id: id, offset: offset, value: false };
        }
        else {
            return { kind: "Token", subkind: "Boolean   ", id: id, offset: offset, value: true };
        }
    },

    number: function (id: number, offset: number, word: string): TokenNumber {
        return { kind: "Token", subkind: "Number    ", id: id, offset: offset, value: Number(word) };
    },

    string: function (id: number, offset: number, word: string): TokenString {
        return { kind: "Token", subkind: "String    ", id: id, offset: offset, value: word };
    },

    identifier: function (id: number, offset: number, word: string): TokenIdentifier {
        return { kind: "Token", subkind: "Identifier", id: id, offset: offset, value: word };
    },
}

// type predicates

export const is_token = {
    whitespace: function(item: Item): item is TokenWhitespace {
        return item.kind === "Token" && item.subkind === "Whitespace";
    },

    open: function(item: Item): item is TokenOpen {
        return item.kind === "Token" && item.subkind === "Open      ";
    },

    close: function(item: Item): item is TokenClose {
        return item.kind === "Token" && item.subkind === "Close     ";
    },

    boolean: function(item: Item): item is TokenBoolean {
        return item.kind === "Token" && item.subkind === "Boolean   ";
    },

    number: function(item: Item): item is TokenNumber {
        return item.kind === "Token" && item.subkind === "Number    ";
    },

    string: function(item: Item): item is TokenString {
        return item.kind === "Token" && item.subkind === "String    ";
    },

    identifier: function(item: Item): item is TokenIdentifier {
        return item.kind === "Token" && item.subkind === "Identifier";
    },
};
