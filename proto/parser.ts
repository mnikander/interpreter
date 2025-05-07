// Copyright (c) 2025 Marco Nikander

import { AST, Leaf, make_leaf } from "./ast";
import { Result } from "./error";
import { is_token, Token } from "./token";
import { ParseState, Production, asterisk, tuple, variant } from "./productions";

// line = expr *space
export function line(index: number, tokens: readonly Token[]): ParseState {
    const production_rule: Production = tuple([ expr, asterisk(space) ]);
    return production_rule(index, tokens);;
}

// expr = *space (atom / (open *space expr *(space *space expr) close))
export function expr(index: number, tokens: readonly Token[]): ParseState {
    const production_rule: Production = tuple([ asterisk(space), variant([ atom, tuple([ open, expr, asterisk(tuple([ space, asterisk(space), expr ])), close ]) ]) ]);
    return production_rule(index, tokens);
}

// atom = boolean / number / string / identifier
export function atom(index: number, tokens: readonly Token[]): ParseState {
    const production_rule: Production = variant([ boolean, number ]);
    return production_rule(index, tokens);
}

export function space(index: number, tokens: readonly Token[]): ParseState {
    const token: Token = tokens[index];
    if (is_token.whitespace(token)) {
        return {index: index+1, result: { ok: true, value: make_leaf(token) }};
    }
    else {
        return { index: index, result: { ok: false, error: { kind: "Error", subkind: "Parsing", token_id: index, message: "a whitespace"}}};
    }
}

export function open(index: number, tokens: readonly Token[]): ParseState {
    const token: Token = tokens[index];
    if (is_token.open(token)) {
        return {index: index+1, result: { ok: true, value: make_leaf(token) }};
    }
    else {
        return { index: index, result: { ok: false, error: { kind: "Error", subkind: "Parsing", token_id: index, message: "("}}};
    }
}

export function close(index: number, tokens: readonly Token[]): ParseState {
    const token: Token = tokens[index];
    if (is_token.close(token)) {
        return {index: index+1, result: { ok: true, value: make_leaf(token) }};
    }
    else {
        return { index: index, result: { ok: false, error: { kind: "Error", subkind: "Parsing", token_id: index, message: ")"}}};
    }
}

export function boolean(index: number, tokens: readonly Token[]): ParseState {
    const token: Token = tokens[index];
    if (is_token.boolean(token)) {
        return {index: index+1, result: { ok: true, value: make_leaf(token) }};
    }
    else {
        return { index: index, result: { ok: false, error: { kind: "Error", subkind: "Parsing", token_id: index, message: "a boolean"}}};
    }
}

export function number(index: number, tokens: readonly Token[]): ParseState {
    const token: Token = tokens[index];
    if (is_token.number(token)) {
        return {index: index+1, result: { ok: true, value: make_leaf(token) }};
    }
    else {
        return { index: index, result: { ok: false, error: { kind: "Error", subkind: "Parsing", token_id: index, message: "a number"}}};
    }
}
