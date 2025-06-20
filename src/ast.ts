// Copyright (c) 2025 Marco Nikander

import { Item } from "./item";
import { Token, TokenBoolean, TokenNumber, TokenString, TokenIdentifier } from "./token";

export type AST = Leaf | Call;

// types for function calls and special forms

export interface Call extends Item {
    kind: string,
    token_id: number,
    node_id: number,
    data: AST[]
};

export interface Let extends Call {
    kind: "Call",
    token_id: number,
    node_id: number,
    data: [AST, AST, AST, AST]
};

// type predicates

export function is_call(item: Item): item is Call { return item.kind === "Call"; }

export function is_call_let(item: Item): item is Let {
    return is_call(item)
    && item.data.length === 4
    && is_leaf_identifier(item.data[0])
    && item.data[0].value === 'let'
    && is_leaf_identifier(item.data[1]);
}

// constructor

export function make_call(node_counter: number, token: Token, data: AST[]): Call {
    return { kind: "Call", token_id: token.id, node_id: node_counter, data: data };
}

// leaf types for the AST

export interface Leaf extends Item {
    kind: string,
    token_id: number,
    node_id: number,
    value: boolean | number | string,
}

export interface LeafBoolean    extends Leaf { kind: "Boolean",    token_id: number, node_id: number, value: boolean };
export interface LeafNumber     extends Leaf { kind: "Number",     token_id: number, node_id: number, value: number };
export interface LeafString     extends Leaf { kind: "String",     token_id: number, node_id: number, value: string };
export interface LeafIdentifier extends Leaf { kind: "Identifier", token_id: number, node_id: number, value: string };

// type predicates for leaves

export function is_leaf_boolean(item: Item): item is LeafBoolean { return item.kind === "Boolean"; }
export function is_leaf_number(item: Item): item is LeafNumber { return item.kind === "Number"; }
export function is_leaf_string(item: Item): item is LeafString { return item.kind === "String"; }
export function is_leaf_identifier(item: Item): item is LeafIdentifier { return item.kind === "Identifier"; }

// constructors for leaves

export function make_leaf(node_counter: number, token: TokenBoolean | TokenNumber | TokenString | TokenIdentifier): Leaf {
    return {kind: token.subkind, token_id: token.id, node_id: node_counter, value: token.value}
}
