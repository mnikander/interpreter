// Copyright (c) 2025 Marco Nikander

import { Item } from "./item";
import { Token } from "./token";

export type AST = Leaf | Node;

// node types for the AST

export interface Node extends Item {
    kind: string,
    subkind: string,
    token_id: number,
    node_id: number,
    data: AST[]
};

// type predicates for nodes

export function is_node(item: Item): item is Node { return item.kind === "Node"; }

// leaf types for the AST

export interface Leaf extends Item {
    kind: string,
    subkind: string,
    token_id: number,
    node_id: number,
    value: boolean | number | string,
}

export interface LeafBoolean    extends Leaf { kind: "Leaf", subkind: "Boolean",    token_id: number, node_id: number, value: boolean };
export interface LeafNumber     extends Leaf { kind: "Leaf", subkind: "Number",     token_id: number, node_id: number, value: number };
export interface LeafString     extends Leaf { kind: "Leaf", subkind: "String",     token_id: number, node_id: number, value: string };
export interface LeafIdentifier extends Leaf { kind: "Leaf", subkind: "Identifier", token_id: number, node_id: number, value: string };

// type predicates for leaves

export function is_leaf(item: Item): item is Leaf { return item.kind === "Leaf"; }
export function is_leaf_boolean(item: Item): item is LeafBoolean { return is_leaf(item) && item.subkind === "Boolean"; }
export function is_leaf_number(item: Item): item is LeafNumber { return is_leaf(item) && item.subkind === "Number"; }
export function is_leaf_string(item: Item): item is LeafString { return is_leaf(item) && item.subkind === "String"; }
export function is_leaf_identifier(item: Item): item is LeafIdentifier { return is_leaf(item) && item.subkind === "Identifier"; }

// constructors for leaves

export function make_leaf(index: number, node_counter: number, token: Token): Leaf {
    return {kind: "Leaf", subkind: token.subkind, token_id: token.id, node_id: node_counter, value: token.value}
}
