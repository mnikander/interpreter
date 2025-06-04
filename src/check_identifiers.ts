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
            return { ok: false, error: error("Semantic", "unknown identifier", ast.token_id)};
        }
    }
    else if (is_node_let(ast)) {
        const name  = ast.data[1];
        const value = ast.data[2];
        const body  = ast.data[3];

        const name_check = is_leaf_identifier(name);
        if (!name_check) return { ok: false, error: error("Semantic", "not a valid identifier", name.token_id) };

        const value_check = check_identifiers(value, env);
        if (!value_check.ok) return value_check;

        let extended_env: Identifiers = { parent: env, symbols: new Set<string>() };
        extended_env.symbols.add(name.value);
        const body_check = check_identifiers(body, extended_env);
        if (!body_check.ok) return body_check;

        return { ok: true, value: undefined };
    }
    else if (is_node(ast)) {
        for (let child of ast.data) {
            const result = check_identifiers(child, env);
            if (!result.ok) return { ok: false, error: result.error};
        }
        return { ok: true, value: undefined };
    }
    else {
        return { ok: false, error: error("Semantic", "unknown kind of AST entry", ast.token_id) };
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
