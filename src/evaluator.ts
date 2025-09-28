// Copyright (c) 2025 Marco Nikander

import { Id, Flat_Expression, Flat_AST, is_literal, is_identifier, is_reference, is_lambda, is_let, is_call, is_binding, is_builtin, is_if, Flat_Builtin } from "./flat_ast";
import { Item } from "./item";

export type Value          = PrimitiveValue | ClosureValue | BuiltinValue;
export type PrimitiveValue = { tag: 'Primitive', value: boolean | number | string}
export type ClosureValue   = { tag: 'Closure', binding: Id, body: Id, env:  Environment };
export type BuiltinValue   = { tag: 'Builtin', name: string, arity: number, impl: ((args: PrimitiveValue[]) => PrimitiveValue), args: PrimitiveValue[] };

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
            throw new Error(`variable with id ${id} is undefined`);
        }
    }
}

export function evaluate(expr: Flat_Expression, ast: Flat_AST, env: Environment): Value {
    if (is_literal(expr, ast)) {
        return { tag: 'Primitive', value: expr.value };
    }
    else if (is_identifier(expr, ast)) {
        throw Error(`Cannot evaluate unresolved reference to '${expr.name}' at token ${expr.token}`);
    }
    else if (is_binding(expr, ast)) {
        return lookup(expr.id, env);
    }
    else if (is_reference(expr, ast)) {
        return evaluate(ast[expr.target.id], ast, env); // could/should this be replaced with a direct lookup?
    }
    else if (is_builtin(expr, ast)) {
        return make_builtin(expr, ast);
    }
    else if (is_lambda(expr, ast)) {
        return { tag: 'Closure', binding: expr.binding, body: expr.body, env: env };
    }
    else if (is_let(expr, ast)) {
        let extended_env = extend_env(env);
        extended_env.bindings.set(expr.binding.id, evaluate(ast[expr.value.id], ast, env));
        return evaluate(ast[expr.body.id], ast, extended_env);
    }
    else if (is_if(expr, ast)) {
        const condition = evaluate(ast[expr.condition.id], ast, env);
        if (is_primitive_value(condition) && typeof (condition.value) === "boolean") {
            return evaluate(ast[condition.value ? expr.if_true.id : expr.if_false.id], ast, env);
        } else {
            throw new Error(`Expect condition in 'if' expression to evaluate to a boolean value, evaluated to ${condition.tag} instead`);
        }
    }
    else if (is_call(expr, ast)) {
        const evaluated_fn  = evaluate(ast[expr.body.id], ast, env);
        const evaluated_arg = evaluate(ast[expr.arg.id], ast, env);
        return apply(evaluated_fn, evaluated_arg, ast);
    }
    else {
        throw new Error("unhandled case in evaluation control flow");
    }
}

function apply(fn: Value, arg: Value, ast: Flat_AST): Value {
    if (is_closure_value(fn)) {
        let extended_env = extend_env(fn.env);
        extended_env.bindings.set(fn.binding.id, arg);
        return evaluate(ast[fn.body.id], ast, extended_env);
    }
    else if (is_builtin_value(fn)) {
        if (!is_primitive_value(arg)) {
            throw Error(`Tried calling builtin function '${fn.name}' with non-primitive argument of type '${arg.tag}'`);
        }
        else {
            fn.args.push(arg);
            if (fn.args.length == fn.arity) {
                return fn.impl(fn.args);
            }
            else {
                return fn;
            }
        }
    }
    else {
        throw(`Attempted to call a non-function value ${fn.value} of type ${fn.tag}`);
    }
}

export function is_primitive_value(item: Item): item is PrimitiveValue {
    return item.tag === 'Primitive';
}

function is_closure_value(item: Item): item is ClosureValue {
    return item.tag === 'Closure';
}

function is_builtin_value(item: Item): item is BuiltinValue {
    return item.tag === 'Builtin';
}

function make_builtin(expr: Flat_Builtin, ast:  Flat_AST): BuiltinValue {
    switch (expr.name) {
        case '~':
            return { tag: 'Builtin', name: expr.name, arity: 1, impl: args => { return { tag: 'Primitive', value: -args[0].value }}, args: [] }
        case '!':
            return { tag: 'Builtin', name: expr.name, arity: 1, impl: args => { return { tag: 'Primitive', value: !args[0].value }}, args: [] }
        case '==':
            return { tag: 'Builtin', name: expr.name, arity: 2, impl: args => { return { tag: 'Primitive', value: args[0].value == args[1].value }}, args: [] }
        case '!=':
            return { tag: 'Builtin', name: expr.name, arity: 2, impl: args => { return { tag: 'Primitive', value: args[0].value != args[1].value }}, args: [] }
        case '<':
            return { tag: 'Builtin', name: expr.name, arity: 2, impl: args => { return { tag: 'Primitive', value: args[0].value < args[1].value }}, args: [] }
        case '>':
            return { tag: 'Builtin', name: expr.name, arity: 2, impl: args => { return { tag: 'Primitive', value: args[0].value > args[1].value }}, args: [] }
        case '<=':
            return { tag: 'Builtin', name: expr.name, arity: 2, impl: args => { return { tag: 'Primitive', value: args[0].value <= args[1].value }}, args: [] }
        case '>=':
            return { tag: 'Builtin', name: expr.name, arity: 2, impl: args => { return { tag: 'Primitive', value: args[0].value >= args[1].value }}, args: [] }
        case '+':
            return { tag: 'Builtin', name: expr.name, arity: 2, impl: args => { return { tag: 'Primitive', value: args[0].value + args[1].value }}, args: [] }
        case '-':
            return { tag: 'Builtin', name: expr.name, arity: 2, impl: args => { return { tag: 'Primitive', value: args[0].value - args[1].value }}, args: [] }
        case '*':
            return { tag: 'Builtin', name: expr.name, arity: 2, impl: args => { return { tag: 'Primitive', value: args[0].value * args[1].value }}, args: [] }
        case '/':
            return { tag: 'Builtin', name: expr.name, arity: 2, impl: args => { return { tag: 'Primitive', value: args[0].value / args[1].value }}, args: [] }
        case '%':
            return { tag: 'Builtin', name: expr.name, arity: 2, impl: args => { return { tag: 'Primitive', value: args[0].value % args[1].value }}, args: [] }
        case '&&':
            return { tag: 'Builtin', name: expr.name, arity: 2, impl: args => { return { tag: 'Primitive', value: args[0].value && args[1].value }}, args: [] } 
        case '||':
            return { tag: 'Builtin', name: expr.name, arity: 2, impl: args => { return { tag: 'Primitive', value: args[0].value || args[1].value }}, args: [] }
    }
}
