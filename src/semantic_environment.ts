// Copyright (c) 2025 Marco Nikander

import { ASTAtom } from "./parser";

export type SemanticSymbol =
    | { kind: "EV_FUNCTION", arity: number }
    | { kind: "EV_VALUE" };

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

export const global_semantic_environment: SemanticEnvironment = {
    parent: undefined,
    symbols: new Map<string, SemanticSymbol>([
        ['+',    { kind: "EV_FUNCTION", arity: 2 }],
        ['-',    { kind: "EV_FUNCTION", arity: 2 }],
        ['*',    { kind: "EV_FUNCTION", arity: 2 }],
        ['/',    { kind: "EV_FUNCTION", arity: 2 }],
        ['%',    { kind: "EV_FUNCTION", arity: 2 }],
        ['<',    { kind: "EV_FUNCTION", arity: 2 }],
        ['>',    { kind: "EV_FUNCTION", arity: 2 }],
        ['<=',   { kind: "EV_FUNCTION", arity: 2 }],
        ['>=',   { kind: "EV_FUNCTION", arity: 2 }],
        ['==',   { kind: "EV_FUNCTION", arity: 2 }],
        ['!=',   { kind: "EV_FUNCTION", arity: 2 }],
        ['&',    { kind: "EV_FUNCTION", arity: 2 }],
        ['|',    { kind: "EV_FUNCTION", arity: 2 }],
        ['!',    { kind: "EV_FUNCTION", arity: 1 }],
        ['if',   { kind: "EV_FUNCTION", arity: 3 }],
        ['help', { kind: "EV_FUNCTION", arity: 0 }],
        ['Help', { kind: "EV_FUNCTION", arity: 0 }],
])}; 
