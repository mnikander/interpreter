// Copyright (c) 2025 Marco Nikander

import { AST, Leaf } from "./ast";
import { Result } from "./error";
import { Token } from "./token";


// line = expr *space
export function parse_line(tokens: Token[]): Result<AST> {
    return { ok: false, error: { kind: "Error", subkind: "Parsing", token_id: 0, message: "a line"} };
}

// expr = *space (atom / (open *space expr *(space *space expr)))
export function parse_expr(tokens: Token[]): Result<AST> {
    return { ok: false, error: { kind: "Error", subkind: "Parsing", token_id: 0, message: "an expression"} };
}

// atom = boolean / number / string / identifier
export function parse_atom(tokens: Token[]): Result<Leaf> {
    return { ok: false, error: { kind: "Error", subkind: "Parsing", token_id: 0, message: "an atom"} };
}
