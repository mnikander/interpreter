// Copyright (c) 2025 Marco Nikander

import { EvaluationEnvironment, EvaluationSymbol, evaluation_define, evaluation_extend, evaluation_lookup } from "./evaluator_environment";
import { is_nd_boolean, is_nd_number, is_nd_identifier, is_nd_call, ASTNode, ASTAtom, is_nd_let} from "./parser";
import { Error, OK, is_error } from "./error";

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
    else if (is_nd_let(ast)) {
        let sub_env = evaluation_extend(env);

        const value = evaluate(ast.expr, env);
        if (is_error(value)) return value;

        let defined: Error | OK = evaluation_define( ast, value, sub_env);
        if (is_error(defined)) {
            return defined;
        }
        else {
            return evaluate(ast.body, sub_env);
        }
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
    return {kind: "Evaluation error", token_id: ast.token_id, message: `invalid expression`};
}
