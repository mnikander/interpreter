// Copyright (c) 2025 Marco Nikander

import { EvaluationEnvironment, EvaluationSymbol, evaluation_lookup } from "./evaluation_environment";
import { is_nd_boolean, is_nd_number, is_nd_identifier, is_nd_call, ASTNode, ASTAtom} from "./parser";
import { Error, is_error } from "./error";

export function evaluate(ast: ASTNode, env: EvaluationEnvironment): Error | EvaluationSymbol {
    if (is_nd_boolean(ast)) {
        let v = (ast as {kind: "ND_BOOLEAN", value: boolean}).value;
        return {kind: 'EVALUATOR_VALUE', value: v};
    }
    else if (is_nd_number(ast)) {
        let v = (ast as {kind: "ND_NUMBER", value: number}).value;
        return {kind: 'EVALUATOR_VALUE', value: v};
    }
    else if (is_nd_identifier(ast)) {
        const identifier = ast as { kind: "ND_IDENTIFIER", value: string};
        return evaluation_lookup(identifier, env) as EvaluationSymbol;
    }
    else if (is_nd_call(ast)) {
        const call: ASTNode               = ast as { kind: "ND_CALL", func: ASTNode, params: ASTNode[]};
        const id: ASTNode                 = call.func as { kind: "ND_IDENTIFIER", value: string };
        const entry: Error | EvaluationSymbol       = evaluate(id, env);
        const ev_args: (Error | EvaluationSymbol)[] = call.params.map((ast: ASTNode) => evaluate(ast, env));
        const err: undefined | Error      = ev_args.find(is_error) as (undefined | Error);
        if(err === undefined) {
            const fn   = (entry as EvaluationSymbol).value as Function;
            const args = (ev_args as EvaluationSymbol[]).map((s: EvaluationSymbol) => { return s.value; });
            return {kind: "EVALUATOR_VALUE", value: fn(args)};
        }
        else {
            return err;
        }
    }
    return {kind: "Evaluation error", message: `invalid expression`};
}
