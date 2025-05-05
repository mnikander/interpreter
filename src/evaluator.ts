// Copyright (c) 2025 Marco Nikander

import { EvaluationEnvironment, EvaluationSymbol, evaluation_lookup } from "./evaluation_environment";
import { is_nd_boolean, is_nd_number, is_nd_identifier, is_nd_call, ASTNode, ASTAtom} from "./parser";
import { Error, is_error } from "./error";

export function evaluate(ast: ASTNode, env: EvaluationEnvironment): Error | EvaluationSymbol {
    if (is_nd_boolean(ast)) {
        return {kind: 'EVALUATOR_VALUE', value: ast.value};
    }
    else if (is_nd_number(ast)) {
        return {kind: 'EVALUATOR_VALUE', value: ast.value};
    }
    else if (is_nd_identifier(ast)) {
        return evaluation_lookup(ast, env) as EvaluationSymbol;
    }
    else if (is_nd_call(ast)) {
        const entry: Error | EvaluationSymbol       = evaluate(ast.func, env);
        const ev_args: (Error | EvaluationSymbol)[] = ast.params.map((ast: ASTNode) => evaluate(ast, env));
        const err: undefined | Error                = ev_args.find(is_error);
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
