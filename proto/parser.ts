// Copyright (c) 2025 Marco Nikander

import { AST } from "./ast";
import { Result } from "./error";
import { Token } from "./token";


// line = expr *space
export function parse_line(tokens: Token[]): Result<AST> {
    return { ok: false, error: { kind: "Error", subkind: "Parsing", token_id: 0, message: "unknown error"} };
}

// expr = *space (atom / (open *space expr *(space *space expr)))
export function parse_expr(tokens: Token[]): Result<AST> {
    return { ok: false, error: { kind: "Error", subkind: "Parsing", token_id: 0, message: "unknown error"} };
}
