// Copyright (c) 2025 Marco Nikander

import { Item } from "./item";

export interface Token extends Item {
    kind: "Token",
    subkind: string,
    token_id: number,
}

export interface TokenOpen extends Token {
    kind: "Token",
    subkind: "Open",
    token_id: number,
}

export interface TokenClose extends Token {
    kind: "Token",
    subkind: "Close",
    token_id: number,
}

export interface TokenAtom extends Token {
    kind: "Token",
    subkind: "Atom",
    token_id: number,
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

export function is_token_atom(item: Item): item is TokenAtom {
    return is_token(item) && item.subkind === "Atom";
}
