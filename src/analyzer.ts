// Copyright (c) 2025 Marco Nikander

import { builtin } from "./builtin";
import { is_nd_boolean, is_nd_number, is_nd_identifier, is_nd_call, ASTNode, ASTAtom} from "./parser";
import { Error, OK, is_error } from "./error";

export type Symbol =
    | { kind: "EV_FUNCTION", value: boolean | number | ((...args: any[]) => any), arity: number, about?: string, }
    | { kind: "EV_VALUE",    value: boolean | number };

export function lookup(identifier: ASTAtom, builtin: Map<string, Symbol>): undefined | Symbol {
    return builtin.get(String(identifier.value));
}

export function analyze(ast: ASTNode): Error | OK {
    if (is_nd_boolean(ast)) {
        return {kind: 'OK'};
    }
    else if (is_nd_number(ast)) {
        return {kind: 'OK'};
    }
    else if (is_nd_identifier(ast)) {
        const identifier = ast as { kind: "ND_IDENTIFIER", value: string};
        const entry: undefined | Symbol = lookup(identifier, builtin);
        if (entry !== undefined) {
            return {kind: 'OK'};
        } else {
            return {kind: "Semantic Error", message: `unknown identifier '${identifier.value}'`};
        }
    }
    else if (is_nd_call(ast)) {
        const call: ASTNode             = ast as { kind: "ND_CALL", func: ASTNode, params: ASTNode[]};
        const id: ASTNode               = call.func as { kind: "ND_IDENTIFIER", value: string };
        const entry: undefined | Symbol = lookup(id, builtin);
        if(entry !== undefined && entry.kind === "EV_FUNCTION") {
            if(entry.arity === call.params.length) {
                const ev_args: (Error | OK)[] = call.params.map(analyze);
                const err: undefined | Error  = ev_args.find(is_error) as (undefined | Error);
                if(err === undefined) {
                    return {kind: 'OK'};
                }
                else {
                    return err;
                }
            }
            else {
                return {kind: "Semantic Error", message: `${call.params.length} argument(s) provided, expected ${entry.arity}`};
            }
        }
        else {
            const atom = call.func as ASTAtom;
            let m: string = `expected a function identifier, got '${atom.value}'`;
            if(typeof atom.value === "number") {
                m += ".\nMaybe you forgot a space between a '+' or '-' and a number";
            }
            return {kind: "Semantic Error", message: m};
        }
    }
    return {kind: "Semantic Error", message: `invalid expression`};
}
