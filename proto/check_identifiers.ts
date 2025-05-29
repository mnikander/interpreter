// Copyright (c) 2025 Marco Nikander

import { AST, is_leaf, is_leaf_boolean, is_leaf_identifier, is_leaf_number, is_leaf_string, is_node } from "./ast";
import { ValueEnvironment } from "./evaluator";
import { error, Result } from "./error";

export function check_identifiers(ast: AST, env: ValueEnvironment): Result<undefined> {
    if (is_leaf_boolean(ast) || is_leaf_number(ast) || is_leaf_string(ast)) {
        return { ok: true, value: undefined};
    }
    else if (is_leaf_identifier(ast)) {
        // TODO: insert the actual identifier checking here
        return { ok: true, value: undefined};
    }
    else if (is_node(ast)) {
        for (let child of ast.data) {
            const result = check_identifiers(child, env);
            if (!result.ok) return { ok: false, error: result.error};
        }
        return { ok: true, value: undefined };
    }
    else {
        return { ok: false, error: error("Analyzing", "unknown kind of AST entry", ast.token_id) };
    }
}
