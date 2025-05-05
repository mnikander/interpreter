// Copyright (c) 2025 Marco Nikander

import { ASTAtom } from "./parser";

export type SemanticSymbol =
    | { kind: "ANALYZER_FUNCTION", arity: number }
    | { kind: "ANALYZER_VALUE" };

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

export type SemanticEnvironment = {
    parent: undefined | SemanticEnvironment,
    symbols: Map<string, SemanticSymbol>,
};
