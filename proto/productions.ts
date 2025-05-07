// Copyright (c) 2025 Marco Nikander

import { Token } from "./token";
import { Result, is_error, is_ok } from "./error";
import { AST } from "./ast";

// Meta-rules to assemble a grammar more easily

export type ParseState = { index: number, result: Result<AST> };
export type Production = ( index: number, tokens: readonly Token[]) => ParseState;

export function asterisk(production: Production): Production {
    return (function(index: number, tokens: readonly Token[]): ParseState {
        let state: ParseState = { index: index, result: { ok: true, value: { kind: "Node", }}};
        let attempt: ParseState = state;
        while(is_ok(attempt.result)) {
            state = attempt; // only update the state if the previous attempt was error-free
            attempt = production(index, tokens);
        }
        return state;
    });
}

export function tuple(productions: Production[]): Production {
    return (function(index: number, tokens: readonly Token[]): ParseState {
        let state: ParseState = { index: index, result: { ok: true, value: { kind: "Node", }}};
        for (let prod of productions) {
            state = prod(index, tokens);
            if (is_error(state.result)) return state;
        }
        return state;
    });
}

export function variant(productions: Production[]): Production {
    return (function(index: number, tokens: readonly Token[]): ParseState {
        let state: ParseState = { index: index, result: { ok: true, value: { kind: "Node", }}};
        for (let prod of productions) {
            state = prod(index, tokens);
            if (is_ok(state.result)) return state;
        }
        return state;
    });
}
