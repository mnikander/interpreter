// Copyright (c) 2025 Marco Nikander

import { Item } from "./item";

export type Token =
    | TokenOpen
    | TokenClose
    | TokenBoolean
    | TokenNumber
    | TokenString
    | TokenIdentifier;

export interface TokenOpen {
    kind: "Token",
    subkind: "Open",
    id: number,
    value: "(",
}

export interface TokenClose {
    kind: "Token",
    subkind: "Close",
    id: number,
    value: ")",
}

export interface TokenBoolean {
    kind: "Token",
    subkind: "Boolean",
    id: number,
    value: boolean,
}

export interface TokenNumber {
    kind: "Token",
    subkind: "Number",
    id: number,
    value: number,
}

export interface TokenString {
    kind: "Token",
    subkind: "String",
    id: number,
    value: string,
}

export interface TokenIdentifier {
    kind: "Token",
    subkind: "Identifier",
    id: number,
    value: string,
}

// token construction

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

export const is_token = {
    open: function(item: Item): item is TokenOpen {
        return item.kind === "Token" && item.subkind === "Open";
    },

    close: function(item: Item): item is TokenClose {
        return item.kind === "Token" && item.subkind === "Close";
    },

    boolean: function(item: Item): item is TokenBoolean {
        return item.kind === "Token" && item.subkind === "Boolean";
    },

    number: function(item: Item): item is TokenNumber {
        return item.kind === "Token" && item.subkind === "Number";
    },

    string: function(item: Item): item is TokenString {
        return item.kind === "Token" && item.subkind === "String";
    },

    identifier: function(item: Item): item is TokenIdentifier {
        return item.kind === "Token" && item.subkind === "Identifier";
    },
};
