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
    tag: "Token",
    subtag: "Whitespace",
    id: number,
    offset: number,
    value: string,
}

export interface TokenOpen {
    tag: "Token",
    subtag: "Open      ",
    id: number,
    offset: number,
    value: "(",
}

export interface TokenClose {
    tag: "Token",
    subtag: "Close     ",
    id: number,
    offset: number,
    value: ")",
}

export interface TokenBoolean {
    tag: "Token",
    subtag: "Boolean   ",
    id: number,
    offset: number,
    value: boolean,
}

export interface TokenNumber {
    tag: "Token",
    subtag: "Number    ",
    id: number,
    offset: number,
    value: number,
}

export interface TokenString {
    tag: "Token",
    subtag: "String    ",
    id: number,
    offset: number,
    value: string,
}

export interface TokenIdentifier {
    tag: "Token",
    subtag: "Identifier",
    id: number,
    offset: number,
    value: string,
}

// token construction

export const make_token = {
    whitespace: function (id: number, offset: number, word: string): TokenWhitespace {
        return { tag: "Token", subtag: "Whitespace", id: id, offset: offset, value: word };
    },

    open: function (id: number, offset: number, word: string): TokenOpen {
       return { tag: "Token", subtag: "Open      ", id: id, offset: offset, value: "(" };
    },

    close: function (id: number, offset: number, word: string): TokenClose {
        return { tag: "Token", subtag: "Close     ", id: id, offset: offset, value: ")" };
    },

    boolean: function (id: number, offset: number, word: "true" | "True" | "false" | "False"): TokenBoolean {
        if (word === "false" || word === "False") {
            return { tag: "Token", subtag: "Boolean   ", id: id, offset: offset, value: false };
        }
        else {
            return { tag: "Token", subtag: "Boolean   ", id: id, offset: offset, value: true };
        }
    },

    number: function (id: number, offset: number, word: string): TokenNumber {
        return { tag: "Token", subtag: "Number    ", id: id, offset: offset, value: Number(word) };
    },

    string: function (id: number, offset: number, word: string): TokenString {
        return { tag: "Token", subtag: "String    ", id: id, offset: offset, value: word };
    },

    identifier: function (id: number, offset: number, word: string): TokenIdentifier {
        return { tag: "Token", subtag: "Identifier", id: id, offset: offset, value: word };
    },
}

// type predicates

export const is_token = {
    whitespace: function(item: Item): item is TokenWhitespace {
        return item.tag === "Token" && item.subtag === "Whitespace";
    },

    open: function(item: Item): item is TokenOpen {
        return item.tag === "Token" && item.subtag === "Open      ";
    },

    close: function(item: Item): item is TokenClose {
        return item.tag === "Token" && item.subtag === "Close     ";
    },

    boolean: function(item: Item): item is TokenBoolean {
        return item.tag === "Token" && item.subtag === "Boolean   ";
    },

    number: function(item: Item): item is TokenNumber {
        return item.tag === "Token" && item.subtag === "Number    ";
    },

    string: function(item: Item): item is TokenString {
        return item.tag === "Token" && item.subtag === "String    ";
    },

    identifier: function(item: Item): item is TokenIdentifier {
        return item.tag === "Token" && item.subtag === "Identifier";
    },
};
