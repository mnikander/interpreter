// Copyright (c) 2025 Marco Nikander

import { Error, OK } from "./error";
import { ASTAtom, is_nd_identifier, NodeLet } from "./parser";

export type SemanticSymbol =
    | { kind: "SEMANTIC_FUNCTION", arity: number }
    | { kind: "SEMANTIC_VALUE" };

export function semantic_lookup(identifier: ASTAtom, environment: SemanticEnvironment): undefined | SemanticSymbol {
    const entry: undefined | SemanticSymbol = environment.symbols.get(String(identifier.value));
    if (entry !== undefined) {
        return entry;
    }
    else {
        if (environment.parent !== undefined) {
            return semantic_lookup(identifier, environment.parent);
        }
        else {
            // we are already in the global context (the root node), and have nowhere left to search for the SemanticSymbol
            return undefined;
        }
    }
}

export function semantic_define(node: NodeLet, env: SemanticEnvironment): Error | OK {
    if (env.symbols.get(node.name.value)) {
        return { kind: "Semantic error", token_id: node.token_id, message: "attempted to redefine an identifier which already exists"}
    }
    else {
        if (is_nd_identifier(node.expr)) {
            const lookup = semantic_lookup(node.expr, env);
            if (lookup === undefined) {
                env.symbols.set(node.name.value, { kind: "SEMANTIC_VALUE" });
                return { kind: "OK" };
            }
            else {
                if (lookup.kind === "SEMANTIC_FUNCTION" ) {
                    env.symbols.set(node.name.value, { kind: "SEMANTIC_FUNCTION", arity: lookup.arity });
                }
                else if (lookup.kind === "SEMANTIC_VALUE" ) {
                    env.symbols.set(node.name.value, { kind: "SEMANTIC_VALUE" });
                }
                else {
                    return { kind: "Semantic error", token_id: node.expr.token_id, message: "unknown semantics, neither a function nor a value"}
                }
            }
        }
        else {
            env.symbols.set(node.name.value, { kind: "SEMANTIC_VALUE" });
            // TODO:
            // - this will break for lambda expressions, they are not a value, and the arity must be set somehow
            // - functions of higher order will also be problematic here, their arity must be deduced somehow
            // - I need a clean solution to deduce the arity of an arbitrary AST node / subtree
        }
    }
    return { kind: "OK" };
}

export function semantic_extend(env: SemanticEnvironment): SemanticEnvironment {
    return { parent: env, symbols: new Map<string, SemanticSymbol>()};
}

export type SemanticEnvironment = {
    parent: undefined | SemanticEnvironment,
    symbols: Map<string, SemanticSymbol>,
};
