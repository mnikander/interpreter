// Copyright (c) 2025 Marco Nikander

import { Token } from "./token";
import { Result, is_error, is_ok } from "./error";
import { AST } from "./ast";

// Meta-rules to assemble a grammar more easily

export type Production = (tokens: Token[]) => (Result<AST>);

export function asterisk(production: Production): Production {
    return (function(tokens: Token[]): Result<AST> { 
        let result: Result<AST> = { ok: true, value: { kind: "Node", }};
        let attempt: Result<AST> = result;
        while(is_ok(attempt)) {
            result = attempt; // only update the result if the previous attempt was error-free
            attempt = production(tokens);
        }
        return result;
    });
}

export function tuple(productions: Production[]): Production {
    return (function(tokens: Token[]): Result<AST> {
        let result: Result<AST> = { ok: true, value: { kind: "Node", }};
        for (let prod of productions) {
            result = prod(tokens);
            if (is_error(result)) return result;
        }
        return result;
    });
}

export function variant(productions: Production[]): Production {
    return (function(tokens: Token[]): Result<AST> {
        let result: Result<AST> = { ok: true, value: { kind: "Node", }};
        for (let prod of productions) {
            result = prod(tokens);
            if (is_ok(result)) return result;
        }
        return result;
    });
}
