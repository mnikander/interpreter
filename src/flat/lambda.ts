// Copyright (c) 2025 Marco Nikander

import { Value, Flat_Expression, Flat_AST, is_literal, is_identifier, is_reference, is_lambda, is_let, is_call, is_binding, is_builtin, is_if } from "./flat_ast";
import { evaluate_builtin } from "./builtin";

// note that the environment stores everything as dynamic (i.e. runtime) values, even the constants from the Flat_AST, so that everything can be evaluated directly
export type Environment = {
    parent: undefined | Environment,
    bindings: Map<number, Value>,
};

export function make_env(): Environment { return { parent: undefined, bindings: new Map<number, Value>()} }

function extend_env(env: Environment): Environment { return { parent: env, bindings: new Map<number, Value>()}; }

export function lookup(id: number, env: Environment): Value {
    const entry: undefined | Value = env.bindings.get(id);
    if (entry !== undefined) {
        return entry;
    }
    else {
        if (env.parent !== undefined) {
            return lookup(id, env.parent);
        }
        else {
            throw new Error(`variable with id ${id} is undefined`)
        }
    }
}

export function evaluate(expr: Flat_Expression, ast: Flat_AST, env: Environment, stacked_args: Value[]): Value {
    if (is_literal(expr, ast)) {
        return expr.value;
    }
    else if (is_identifier(expr, ast)) {
        throw Error(`Cannot evaluate unresolved reference to '${expr.name}' at token ${expr.token}`)
    }
    else if (is_binding(expr, ast)) {
        return lookup(expr.id, env);
    }
    else if (is_builtin(expr, ast)) {
        return evaluate_builtin(expr, ast, env, stacked_args);
    }
    else if (is_reference(expr, ast)) {
        return evaluate(ast[expr.target.id], ast, env, stacked_args);
    }
    else if (is_lambda(expr, ast)) {
        // dequeue an argument and store it in the environment instead
        let first = stacked_args.pop();
        if (first !== undefined) {
            let extended_env = extend_env(env);
            extended_env.bindings.set(expr.binding.id, first);
            return evaluate(ast[expr.body.id], ast, extended_env, stacked_args)
        }
        else {
            throw new Error("No arguments to bind to variable")
        }
    }
    else if (is_let(expr, ast)) {
        let extended_env = extend_env(env);
        extended_env.bindings.set(expr.binding.id, evaluate(ast[expr.value.id], ast, env, stacked_args));
        return evaluate(ast[expr.body.id], ast, extended_env, stacked_args);
    }
    else if (is_if(expr, ast)) {
        const condition = evaluate(ast[expr.condition.id], ast, env, stacked_args);
        if (typeof condition === "boolean") {
            return evaluate(ast[condition ? expr.if_true.id : expr.if_false.id], ast, env, stacked_args);
        } else {
            throw new Error(`Condition in 'if' expression did not evaluate to a boolean value`);
        }
    }
    else if (is_call(expr, ast)) {
        // enqueue the provided argument
        const evaluated_arg = evaluate(ast[expr.arg.id], ast, env, stacked_args);
        return evaluate(ast[expr.body.id], ast, env, [...stacked_args, evaluated_arg]);
    }
    else {
        throw new Error("unhandled case in evaluation control flow");
    }
}
