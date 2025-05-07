// Copyright (c) 2025 Marco Nikander

import { AST } from "./ast";
import { Result } from "./error";
import { Token } from "./token";

export function parse(tokens: Token[]): Result<AST> {
    return { ok: false, error: { kind: "Error", subkind: "Parsing", token_id: 0, message: "unknown error"} };
}
