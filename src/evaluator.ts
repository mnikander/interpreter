// Copyright (c) 2025 Marco Nikander

import { builtin } from "./builtin";
import { is_nd_boolean, is_nd_number, is_nd_identifier, is_nd_call, ASTNode, ASTAtom} from "./parser";
import { Error, is_error } from "./error";
import { lookup, Symbol } from "./analyzer";

export function evaluate(ast: ASTNode): Error | Symbol {
    if (is_nd_boolean(ast)) {
        let v = (ast as {kind: "ND_BOOLEAN", value: boolean}).value;
        return {kind: 'EV_VALUE', value: v};
    }
    else if (is_nd_number(ast)) {
        let v = (ast as {kind: "ND_NUMBER", value: number}).value;
        return {kind: 'EV_VALUE', value: v};
    }
    else if (is_nd_identifier(ast)) {
        const identifier = ast as { kind: "ND_IDENTIFIER", value: string};
        return lookup(identifier, builtin) as Symbol;
    }
    else if (is_nd_call(ast)) {
        const call: ASTNode               = ast as { kind: "ND_CALL", func: ASTNode, params: ASTNode[]};
        const id: ASTNode                 = call.func as { kind: "ND_IDENTIFIER", value: string };
        const entry: Error | Symbol       = evaluate(id);
        const ev_args: (Error | Symbol)[] = call.params.map(evaluate);
        const err: undefined | Error      = ev_args.find(is_error) as (undefined | Error);
        if(err === undefined) {
            const fn   = (entry as Symbol).value as Function;
            const args = (ev_args as Symbol[]).map((s: Symbol) => { return s.value; });
            return {kind: "EV_VALUE", value: fn(args)};
        }
        else {
            return err;
        }
    }
    return {kind: "Evaluation Error", message: `invalid expression`};
}
