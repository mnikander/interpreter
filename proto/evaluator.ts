// Copyright (c) 2025 Marco Nikander

import { AST, is_leaf_boolean, is_leaf_number, is_leaf_string } from "./ast";
import { Result, error, is_error, is_ok } from "./error";

export function evaluate(ast: AST, env: undefined): Result<boolean | number | string> {
    if (is_leaf_boolean(ast) || is_leaf_number(ast) || is_leaf_string(ast)) {
        return { ok: true, value: ast.value };
    }
    else {
        return { ok: false, error: error("Evaluating", "ast", ast.token_id)};
    }
}
