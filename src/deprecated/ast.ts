// Copyright (c) 2025 Marco Nikander

import { Item } from "./../item";
import { Token, TokenBoolean, TokenNumber, TokenString, TokenIdentifier } from "./token";

export type AST = Atom | Call;

// types for function calls, special forms, and atoms

export interface Call extends Item {
    tag: string,
    token: number,
    id: number,
    data: AST[]
};

export interface Lambda extends Call {
    tag: "Call      ",
    token: number,
    id: number,
    data: [AST, AST, AST]
};

export interface Let extends Call {
    tag: "Call      ",
    token: number,
    id: number,
    data: [AST, AST, AST, AST]
};

export interface Atom extends Item {
    tag: string,
    token: number,
    id: number,
    value: boolean | number | string,
}

export interface AtomBoolean    extends Atom { tag: "Boolean   ", token: number, id: number, value: boolean };
export interface AtomNumber     extends Atom { tag: "Number    ", token: number, id: number, value: number };
export interface AtomString     extends Atom { tag: "String    ", token: number, id: number, value: string };
export interface AtomIdentifier extends Atom { tag: "Identifier", token: number, id: number, value: string };

// type predicates

export function is_call(item: Item): item is Call { return item.tag === "Call      "; }

export function is_let(item: Item): item is Let {
    return is_call(item)
    && item.data.length === 4
    && is_identifier(item.data[0])
    && item.data[0].value === 'let'
    && is_identifier(item.data[1]);
}

export function is_lambda(item: Item): item is Lambda {
    return is_call(item)
    && item.data.length === 3
    && is_identifier(item.data[0])
    && item.data[0].value === 'lambda'
    && is_identifier(item.data[1]);
}

export function is_boolean(item: Item): item is AtomBoolean { return item.tag === "Boolean   "; }
export function is_number(item: Item): item is AtomNumber { return item.tag === "Number    "; }
export function is_string(item: Item): item is AtomString { return item.tag === "String    "; }
export function is_identifier(item: Item): item is AtomIdentifier { return item.tag === "Identifier"; }

// constructors

export function make_call(node_counter: number, token: Token, data: AST[]): Call {
    return { tag: "Call      ", token: token.id, id: node_counter, data: data };
}

export function make_atom(node_counter: number, token: TokenBoolean | TokenNumber | TokenString | TokenIdentifier): Atom {
    return {tag: token.subtag, token: token.id, id: node_counter, value: token.value}
}
