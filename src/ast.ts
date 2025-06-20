// Copyright (c) 2025 Marco Nikander

import { Item } from "./item";
import { Token, TokenBoolean, TokenNumber, TokenString, TokenIdentifier } from "./token";

export type NodeToTokenId = Map<number, number>;
export type AST = Atom | Call;

// types for function calls, special forms, and atoms

export interface Call extends Item {
    kind: string,
    node_id: number,
    data: AST[]
};

export interface Let extends Call {
    kind: "Call",
    node_id: number,
    data: [AST, AST, AST, AST]
};

export interface Atom extends Item {
    kind: string,
    node_id: number,
    value: boolean | number | string,
}

export interface AtomBoolean    extends Atom { kind: "Boolean",    token_id: number, node_id: number, value: boolean };
export interface AtomNumber     extends Atom { kind: "Number",     token_id: number, node_id: number, value: number };
export interface AtomString     extends Atom { kind: "String",     token_id: number, node_id: number, value: string };
export interface AtomIdentifier extends Atom { kind: "Identifier", token_id: number, node_id: number, value: string };

// type predicates

export function is_call(item: Item): item is Call { return item.kind === "Call"; }

export function is_let(item: Item): item is Let {
    return is_call(item)
    && item.data.length === 4
    && is_identifier(item.data[0])
    && item.data[0].value === 'let'
    && is_identifier(item.data[1]);
}

export function is_boolean(item: Item): item is AtomBoolean { return item.kind === "Boolean"; }
export function is_number(item: Item): item is AtomNumber { return item.kind === "Number"; }
export function is_string(item: Item): item is AtomString { return item.kind === "String"; }
export function is_identifier(item: Item): item is AtomIdentifier { return item.kind === "Identifier"; }

// constructors

export function make_call(node_counter: number, token: Token, data: AST[]): Call {
    return { kind: "Call", node_id: node_counter, data: data };
}

export function make_atom(node_counter: number, token: TokenBoolean | TokenNumber | TokenString | TokenIdentifier): Atom {
    return {kind: token.subkind, node_id: node_counter, value: token.value}
}
