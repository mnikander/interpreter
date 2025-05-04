// Copyright (c) 2025 Marco Nikander

import { ASTAtom } from "./parser";

export type EvaluationSymbol =
    | { kind: "EV_FUNCTION", value: boolean | number | ((...args: any[]) => any), about?: string, }
    | { kind: "EV_VALUE",    value: boolean | number };

export function evaluation_lookup(identifier: ASTAtom, environment: EvaluationEnvironment): undefined | EvaluationSymbol {
    const entry: undefined | EvaluationSymbol = environment.symbols.get(String(identifier.value));
    if (entry !== undefined) {
        return entry;
    }
    else {
        if (environment.parent !== undefined) {
            return evaluation_lookup(identifier, environment.parent);
        }
        else {
            // we are already in the global context (the root node), and have nowhere left to search for the symbol
            return undefined;
        }
    }
}

export type EvaluationEnvironment = {
    parent: undefined | EvaluationEnvironment,
    symbols: Map<string, EvaluationSymbol>,
};
