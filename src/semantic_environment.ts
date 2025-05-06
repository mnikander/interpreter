// Copyright (c) 2025 Marco Nikander

import { Error, OK } from "./error";
import { ASTAtom, NodeIdentifier, NodeLet } from "./parser";

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
        // TODO: what about functions? How do I figure out if the body is a function and has an arity which needs to be set?
        env.symbols.set(node.name.value, { kind: "SEMANTIC_VALUE" });
        return { kind: "OK" };
    }
}

export function semantic_extend(env: SemanticEnvironment): SemanticEnvironment {
    return { parent: env, symbols: new Map<string, SemanticSymbol>()};
}

export type SemanticEnvironment = {
    parent: undefined | SemanticEnvironment,
    symbols: Map<string, SemanticSymbol>,
};
