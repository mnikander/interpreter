// Copyright (c) 2025 Marco Nikander

import { SemanticEnvironment, SemanticSymbol, semantic_define, semantic_extend, semantic_lookup } from "./semantic_environment";
import { is_nd_boolean, is_nd_number, is_nd_identifier, is_nd_call, ASTNode, ASTAtom, is_nd_let} from "./parser";
import { Error, OK, is_error, number_of_arguments_error } from "./error";

export function analyze(ast: ASTNode, env: SemanticEnvironment): Error | OK {
    if (is_nd_boolean(ast)) {
        return {kind: 'OK'};
    }
    else if (is_nd_number(ast)) {
        return {kind: 'OK'};
    }
    else if (is_nd_identifier(ast)) {
        const entry: undefined | SemanticSymbol = semantic_lookup(ast, env);
        if (entry !== undefined) {
            return {kind: 'OK'};
        } else {
            return {kind: "Semantic error", token_id: ast.token_id, message: `unknown identifier '${ast.value}'`};
        }
    }
    else if (is_nd_let(ast)) {
        // TODO:
        // - should I allow redefining the builtin functions? If not, I need to ensure the builtins are not shadowed, right here

        const checked_expression = analyze(ast.expr, env);
        if (is_error(checked_expression)) return checked_expression;

        let sub_env: SemanticEnvironment = semantic_extend(env);
        const defined_symbol: Error | OK = semantic_define(ast, sub_env);
        if (is_error(defined_symbol)) return defined_symbol;

        const checked_body: Error | OK = analyze(ast.body, sub_env);
        if (is_error(checked_body)) return checked_body;

        return { kind: "OK" };
    }
    else if (is_nd_call(ast)) {
        if (is_nd_identifier(ast.func)) {
            const entry: undefined | SemanticSymbol = semantic_lookup(ast.func, env);
            if(entry !== undefined && entry.kind === "SEMANTIC_FUNCTION") {
                if(entry.arity === ast.params.length) {
                    const ev_args: (Error | OK)[] = ast.params.map((ast: ASTNode) => analyze(ast, env));
                    const err: undefined | Error  = ev_args.find(is_error);
                    if(err === undefined) {
                        return {kind: 'OK'};
                    }
                    else {
                        return err;
                    }
                }
                else {
                    return number_of_arguments_error("Semantic error", ast.params.length, entry.arity, ast.token_id);
                }
            }
            else {
                return {kind: "Semantic error", token_id: ast.token_id, message: `unknown identifier '${ast.func.value}'`};
            }
        }
        else if (is_nd_call(ast.func)) {
            return analyze(ast.func, env);
        }
        else {
            return {kind: "Semantic error", token_id: ast.token_id, message: "expected a function identifier"};
        }
    }
    return {kind: "Semantic error", token_id: ast.token_id, message: `invalid expression`};
}
