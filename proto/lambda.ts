// Copyright (c) 2025 Marco Nikander

export type Id         = {id: number};
export type Constant   = {id: number, kind: 'Constant', value: (boolean | number)};
export type Identifier = {id: number, kind: 'Identifier', name: string};
export type Reference  = {id: number, kind: 'Reference', target: Id};
export type Lambda     = {id: number, kind: 'Lambda', binding: Id, body: Id};
export type Let        = {id: number, kind: 'Let', binding: Id, value: Id, body: Id};
export type Call       = {id: number, kind: 'Call', body: Id, args: Id};
export type Plus       = {id: number, kind: 'Plus'};
export type Minus      = {id: number, kind: 'Minus'};
export type Node       = Constant | Identifier | Reference | Lambda | Let | Call | Plus | Minus;
export type AST        = Node[];
export type Value      = boolean | number;

// TODO: implement built-in functions capable of partial application
//       and give them pre-reserved IDs

export function is_constant(expr: Node, ast: AST): expr is Constant { return expr.kind === 'Constant'; }
export function is_identifier(expr: Node, ast: AST): expr is Identifier { return expr.kind === 'Identifier'; }
export function is_reference(expr: Node, ast: AST): expr is Reference { return expr.kind === 'Reference'; }
export function is_lambda(expr: Node, ast: AST): expr is Lambda { return expr.kind === 'Lambda'; }
export function is_let(expr: Node, ast: AST): expr is Let { return expr.kind === 'Let'; }
export function is_call(expr: Node, ast: AST): expr is Call { return expr.kind === 'Call'; }
export function is_plus(expr: Node, ast: AST): expr is Plus { return expr.kind === 'Plus'; }
export function is_minus(expr: Node, ast: AST): expr is Minus { return expr.kind === 'Minus'; }

// note that the environment stores everything as dynamic (i.e. runtime) values, even the constants from the AST, so that everything can be evaluated directly
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

export function evaluate(expr: Node, ast: AST, env: Environment, queued_args: Value[]): Value {
    if (is_constant(expr, ast)) {
        return expr.value;
    }
    else if (is_identifier(expr, ast)) {
        return lookup(expr.id, env);
    }
    else if (is_reference(expr, ast)) {
        return evaluate(ast[expr.target.id], ast, env, queued_args);
    }
    else if (is_lambda(expr, ast)) {
        // dequeue an argument and store it in the environment instead
        let [first, ...rest] = queued_args;
        let extended_env = extend_env(env);
        extended_env.bindings.set(expr.binding.id, first);
        return evaluate(ast[expr.body.id], ast, extended_env, rest)
    }
    else if (is_let(expr, ast)) {
        let extended_env = extend_env(env);
        extended_env.bindings.set(expr.binding.id, evaluate(ast[expr.value.id], ast, env, queued_args));
        return evaluate(ast[expr.body.id], ast, extended_env, queued_args);
    }
    else if (is_call(expr, ast)) {
        // enqueue the provided argument
        const evaluated_arg = evaluate(ast[expr.args.id], ast, env, queued_args);
        return evaluate(ast[expr.body.id], ast, env, [...queued_args, evaluated_arg]);
    }
    else if (is_plus(expr, ast)) {
        let [first, second, ...rest] = queued_args;
        if (typeof first === "number" && typeof second === "number") {
            return first + second;
        }
        else {
            throw new Error("Plus operator only supports numbers");
        }
    }
    else if (is_minus(expr, ast)) {
        let [first, second, ...rest] = queued_args;
        if (typeof first === "number" && typeof second === "number") {
            return first - second;
        }
        else {
            throw new Error("Plus operator only supports numbers");
        }
    }
    else {
        throw new Error("unhandled case in evaluation control flow");
    }
}

// TODO: add support for builtin functions with different arities
// '!'
// '+' | '-' | '*' | '/' | '%' | '<' | '>' | '<=' | '>=' | '==' | '!=' | '&' | '|' 
// 'if'
