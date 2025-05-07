// Copyright (c) 2025 Marco Nikander

import { Token } from "./token";
import { Result, is_error, is_ok } from "./error";
import { AST } from "./ast";

// Meta-rules to assemble a grammar more easily

export type ParseState = { index: number, result: Result<undefined | AST> };
export type Production = ( index: number, tokens: readonly Token[]) => ParseState;

export function asterisk(production: Production): Production {
    return (function(index: number, tokens: readonly Token[]): ParseState {
        let attempt: ParseState = { index: index, result: { ok: true, value: undefined }};
        let state: ParseState = { index: index, result: { ok: true, value: undefined }};
        if (index > tokens.length) return {index: index, result: { ok: false, error: {kind: "Error", subkind: "Parsing", token_id: index, message: "index out of bounds in asterisk-rule"}}};
        if (index == tokens.length) return state;
        do {
            attempt = production(state.index, tokens);
            if (is_ok(attempt.result) && attempt.result.value !== undefined) {
                state = attempt;
            }
        }
        while (is_ok(attempt.result));
        return state;
    });
}

export function tuple(productions: Production[]): Production {
    return (function(index: number, tokens: readonly Token[]): ParseState {
        if (productions.length < 2) return {index: index, result: { ok: false, error: {kind: "Error", subkind: "Parsing", token_id: index, message: "expected at least 2 rules for tuple of production rules"}}};
        if (index >= tokens.length) return {index: index, result: { ok: false, error: {kind: "Error", subkind: "Parsing", token_id: index, message: "index out of bounds in tuple-rule"}}};
        let attempt: ParseState = { index: index, result: { ok: true, value: undefined }};
        let state: ParseState = { index: index, result: { ok: true, value: undefined }};
        for (let prod of productions) {
            attempt = prod(state.index, tokens); // note that the index may go out-of-bounds here, the production MUST raise an error in that case
            if (is_error(attempt.result)) {
                return attempt;
            }
            else if (attempt.result.value !== undefined) {
                state = attempt;
            }
        }
        return state;
    });
}

export function variant(productions: Production[]): Production {
    return (function(index: number, tokens: readonly Token[]): ParseState {
        if (productions.length < 2) return {index: index, result: { ok: false, error: {kind: "Error", subkind: "Parsing", token_id: index, message: "expected at least 2 rules for variant of production rules"}}};
        if (index >= tokens.length) return {index: index, result: { ok: false, error: {kind: "Error", subkind: "Parsing", token_id: index, message: "index out of bounds in variant-rule"}}};
        let state: ParseState = { index: index, result: { ok: true, value: undefined }};
        for (let prod of productions) {
            state = prod(state.index, tokens);
            if (is_ok(state.result)) return state;
        }
        return state;
    });
}
