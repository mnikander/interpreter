// Copyright (c) 2025 Marco Nikander

import { AST, is_leaf_boolean, is_leaf_identifier, is_leaf_number, is_leaf_string, is_node, is_node_let } from "./ast";
import { error, Result } from "./error";

export type Identifiers = {
    parent: undefined | Identifiers;
    symbols: Set<string>;
};

export function check_identifiers(ast: AST, env: Identifiers): Result<undefined> {
    if (is_leaf_boolean(ast) || is_leaf_number(ast) || is_leaf_string(ast)) {
        return { ok: true, value: undefined};
    }
    else if (is_leaf_identifier(ast)) {
        if (lookup(ast.value, env)) {
            return { ok: true, value: undefined };
        }
        else {
            return { ok: false, error: error("Analyzing", "unknown identifier", ast.token_id)};
        }
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

function lookup(identifier: string, env: Identifiers): boolean {
    if (env.symbols.has(identifier)) {
        return true;
    }
    else if (env.parent !== undefined) {
        return lookup(identifier, env.parent);
    }
    else {
        return false;
    }
}
