// Copyright (c) 2025 Marco Nikander

import { AST, is_leaf_boolean, is_leaf_identifier, is_leaf_number, is_leaf_string, is_node } from "./ast";
import { Result, error, is_error } from "./error";

export type Primitive        = boolean | number | string;
export type Value            = Primitive | ((args: Primitive[]) => Primitive)
export type ValueEnvironment = Map<string, Value>;

export function evaluate(ast: AST, env: ValueEnvironment): Result<Value> {
    if (is_leaf_boolean(ast) || is_leaf_number(ast) || is_leaf_string(ast)) {
        return { ok: true, value: ast.value };
    }
    else if (is_leaf_identifier(ast)) {
        const identifier = env.get(ast.value);
        if (identifier !== undefined) {
            return { ok: true, value: identifier };
        }
        else {
            return { ok: false, error: error("Evaluating", "identifier", ast.token_id)};
        }
    }
    else if (is_node(ast)) {

        let evaluated_terms: Result<Value>[] = ast.data.map((ast: AST) => (evaluate(ast, env)));
        for (let term of evaluated_terms) {
            if (is_error(term)) return term;
        }
        const terms: Value[] = evaluated_terms.map((result: Result<Value>) => ((result as { ok: true, value: Value}).value));
        const fn: Value = terms[0];
        const args: Value[] = terms.slice(1);
        return { ok: true, value: (fn as Function)(args) };
    }
    else {
        return { ok: false, error: error("Evaluating", "unknown AST node", ast.token_id)};
    }
}

export const value_env: ValueEnvironment = new Map<string, Value>([
    ['+',    function ( args: Primitive[] ): Primitive { return (args[0] as number) + (args[1] as number); }],
    ['-',    function ( args: Primitive[] ): Primitive { return (args[0] as number) - (args[1] as number); }],
    ['*',    function ( args: Primitive[] ): Primitive { return (args[0] as number) * (args[1] as number); }],
    ['/',    function ( args: Primitive[] ): Primitive { return (args[0] as number) / (args[1] as number); }],
    ['%',    function ( args: Primitive[] ): Primitive { return (args[0] as number) % (args[1] as number); }],
    ['<',    function ( args: Primitive[] ): Primitive { return (args[0] as number) < (args[1] as number); }],
    ['>',    function ( args: Primitive[] ): Primitive { return (args[0] as number) > (args[1] as number); }],
    ['<=',   function ( args: Primitive[] ): Primitive { return (args[0] as number) <= (args[1] as number); }],
    ['>=',   function ( args: Primitive[] ): Primitive { return (args[0] as number) >= (args[1] as number); }],
    ['==',   function ( args: Primitive[] ): Primitive { return args[0] == args[1]; }],
    ['!=',   function ( args: Primitive[] ): Primitive { return args[0] != args[1]; }],
    ['&',    function ( args: Primitive[] ): Primitive { return (args[0] as boolean) && (args[1] as boolean); }],
    ['|',    function ( args: Primitive[] ): Primitive { return (args[0] as boolean) || (args[1] as boolean); }],
    ['!',    function ( args: Primitive[] ): Primitive { return !(args[0] as boolean); }],
    ['if',   function ( args: Primitive[] ): Primitive { return (args[0] as boolean) ? args[1] : args[2]; }],
    // ['help', function ( args: any[] )     { return help(); }],
    // ['Help', function ( args: any[] )     { return help(); }],
]);
    