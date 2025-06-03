// Copyright (c) 2025 Marco Nikander

import { ASTAtom,NodeLet } from "./parser";
import { Error, OK } from "./error";

export type EvaluationSymbol =
    | { kind: "EVALUATOR_FUNCTION", value: boolean | number | ((...args: any[]) => any), }
    | { kind: "EVALUATOR_VALUE",    value: boolean | number };

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

export function evaluation_define(node: NodeLet, value: EvaluationSymbol, env: EvaluationEnvironment): Error | OK {
    if (env.symbols.get(node.name.value)) {
        return { kind: "Evaluation error", token_id: node.token_id, message: "attempted to redefine an identifier which already exists"}
    }
    else {
        // TODO: what about functions? How do I figure out if the body is a function and has an arity which needs to be set?
        env.symbols.set(node.name.value, value); // TODO: hard-coded to zero, this needs to be the actual value
        return { kind: "OK" };
    }
}

export function evaluation_extend(env: EvaluationEnvironment): EvaluationEnvironment {
    return { parent: env, symbols: new Map<string, EvaluationSymbol>()};
}

export type EvaluationEnvironment = {
    parent: undefined | EvaluationEnvironment,
    symbols: Map<string, EvaluationSymbol>,
};
