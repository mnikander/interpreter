// Copyright (c) 2025 Marco Nikander

import { Item } from "./item";
import { Token } from "./token";

// general types for the AST

export type AST = Leaf | Node;

export interface Leaf extends Item {
    kind: string,
    subkind: string,
    token_id: number,
    node_id: number,
    value: boolean | number | string,
}

export interface Node extends Item {
    kind: string,
    subkind: string,
    token_id: number,
    node_id: number,
    data: AST[]
};

// specific types for the AST

export interface LeafBoolean    extends Leaf { kind: "Leaf", subkind: "Boolean",    token_id: number, node_id: number, value: boolean };
export interface LeafNumber     extends Leaf { kind: "Leaf", subkind: "Number",     token_id: number, node_id: number, value: number };
export interface LeafString     extends Leaf { kind: "Leaf", subkind: "String",     token_id: number, node_id: number, value: string };
export interface LeafIdentifier extends Leaf { kind: "Leaf", subkind: "Identifier", token_id: number, node_id: number, value: string };
export interface LeafReference  extends Leaf { kind: "Leaf", subkind: "Reference",  token_id: number, node_id: number, value: string }; // I could switch to an ID number later

export interface NodeCall extends Node {
    kind: "Node",
    subkind: "Call",
    token_id: number,
    node_id: number,
    data: AST[]
}

export interface NodeLet extends Node {
    kind: "Node",
    subkind: "Let",
    token_id: number,
    node_id: number,
    data: [AST, AST, AST, AST]
}

// type predicates

export function is_leaf(item: Item): item is Leaf { return item.kind === "Leaf"; }
export function is_leaf_boolean(item: Item): item is LeafBoolean { return is_leaf(item) && item.subkind === "Boolean"; }
export function is_leaf_number(item: Item): item is LeafNumber { return is_leaf(item) && item.subkind === "Number"; }
export function is_leaf_string(item: Item): item is LeafString { return is_leaf(item) && item.subkind === "String"; }
export function is_leaf_identifier(item: Item): item is LeafIdentifier { return is_leaf(item) && item.subkind === "Identifier"; }
export function is_leaf_reference(item: Item): item is LeafReference { return is_leaf(item) && item.subkind === "Reference"; }

export function is_node(item: Item): item is Node { return item.kind === "Node"; }

export function is_node_call(item: Item): item is NodeCall {
    return is_node(item)
    && item.subkind === "Call"
    && item.data.length >= 1;
}

export function is_node_let(item: Item): item is NodeLet {
    return is_node(item)
    && item.subkind === "Let"
    && item.data.length === 4
    && is_leaf_identifier(item.data[0])
    && item.data[0].value === 'let'
    && is_leaf_identifier(item.data[1]);
}

export function make_leaf(index: number, node_counter: number, token: Token): Leaf {
    return {kind: "Leaf", subkind: token.subkind, token_id: token.id, node_id: node_counter, value: token.value}
}
