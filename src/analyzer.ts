// Copyright (c) 2025 Marco Nikander

import { SemanticEnvironment, SemanticSymbol, semantic_lookup } from "./semantic_environment";
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
            return {kind: "Semantic error", message: `unknown identifier '${ast.value}'`};
        }
    }
    else if (is_nd_call(ast)) {
        const id: ASTNode = ast.func as { kind: "ND_IDENTIFIER", value: string };
        const entry: undefined | SemanticSymbol = semantic_lookup(id, env);
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
                return {kind: "Semantic error", message: `${ast.params.length} argument(s) provided, expected ${entry.arity}`};
            }
        }
        else {
            const atom = ast.func as ASTAtom;
            let m: string = `expected a function identifier, got '${atom.value}'`;
            if(typeof atom.value === "number") {
                m += ".\nMaybe you forgot a space between a '+' or '-' and a number";
            }
            return {kind: "Semantic error", message: m};
        }
    }
    return {kind: "Semantic error", message: `invalid expression`};
}
