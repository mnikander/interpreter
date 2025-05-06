// Copyright (c) 2025 Marco Nikander

import { SemanticEnvironment, SemanticSymbol, semantic_lookup } from "./analyzer_environment";
import { is_nd_boolean, is_nd_number, is_nd_identifier, is_nd_call, ASTNode, ASTAtom} from "./parser";
import { Error, OK, is_error } from "./error";

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
    else if (is_nd_call(ast)) {
        if (is_nd_identifier(ast.func)) {
            const entry: undefined | SemanticSymbol = semantic_lookup(ast.func, env);
            if(entry !== undefined && entry.kind === "ANALYZER_FUNCTION") {
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
                    return {kind: "Semantic error", token_id: ast.token_id, message: `${ast.params.length} argument(s) provided, expected ${entry.arity}`};
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
            let m: string = `expected a function identifier, got '${ast.func.value}'`;
            if(typeof ast.func.value === "number") {
                m += ".\nMaybe you forgot a space between a '+' or '-' and a number";
            }
            return {kind: "Semantic error", token_id: ast.token_id, message: m};
        }
    }
    return {kind: "Semantic error", token_id: ast.token_id, message: `invalid expression`};
}
