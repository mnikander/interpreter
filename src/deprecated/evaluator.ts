// Copyright (c) 2025 Marco Nikander

import { AST, is_boolean, is_identifier, is_number, is_string, is_call, is_let, AtomIdentifier } from "./ast";
import { Result, make_error, is_error } from "./../error";

export type Primitive        = boolean | number | string;
export type Value            = Primitive | ((args: Primitive[]) => Primitive)
export type Variables        = Map<string, Value>;

export type Environment = {
    parent: undefined | Environment,
    symbols: Variables,
};

export function evaluate(ast: AST, env: Environment): Result<Value> {
    if (is_boolean(ast) || is_number(ast) || is_string(ast)) {
        return { ok: true, value: ast.value };
    }
    else if (is_identifier(ast)) {
        const identifier = lookup(ast.value, env);
        if (identifier !== undefined) {
            return { ok: true, value: identifier };
        }
        else {
            return { ok: false, error: make_error("Evaluation", "identifier", ast.token)};
        }
    }
    else if (is_let(ast)) {
        const name  = (ast.data[1] as AtomIdentifier);
        const value = evaluate(ast.data[2], env);
        if (!value.ok) return value;

        const body = ast.data[3];
        let extended_env: Environment = { parent: env, symbols: new Map<string, Value>() };
        extended_env.symbols.set(name.value, value.value);
        return evaluate(body, extended_env);
    }
    else if (is_call(ast)) {
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
        return { ok: false, error: make_error("Evaluation", "unknown AST node", ast.token)};
    }
}

export const builtin_functions: Environment = {
    parent: undefined,
    symbols: new Map<string, Value>([
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
])};

export function lookup(identifier: string, env: Environment): undefined | Value {
    const entry: undefined | Value = env.symbols.get(String(identifier));
    if (entry !== undefined) {
        return entry;
    }
    else {
        if (env.parent !== undefined) {
            return lookup(identifier, env.parent);
        }
        else {
            // we are already in the global context (the root node), and have nowhere left to search for the symbol
            return undefined;
        }
    }
}

function extend(env: Environment): Environment {
    return { parent: env, symbols: new Map<string, Value>()};
}
