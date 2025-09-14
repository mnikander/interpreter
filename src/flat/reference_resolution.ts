// Copyright (c) 2025 Marco Nikander

import { Id, Value, Flat_Literal, Flat_Identifier, Flat_Reference, Flat_Lambda, Flat_Let, Flat_Call, Flat_Plus,  Flat_Minus, Flat_Expression, Flat_Atom, Flat_AST, is_literal, is_identifier, is_reference, is_lambda, is_let, is_call, is_plus, is_minus, is_binding, Flat_Binding } from "./flat_ast";

export type LookupTable = {
    parent: undefined | LookupTable,
    bindings: Map<string, number>,
};

export function make_env(): LookupTable { return { parent: undefined, bindings: new Map<string, number>()} }

function extend_env(env: LookupTable): LookupTable { return { parent: env, bindings: new Map<string, number>()}; }

export function lookup(name: string, env: LookupTable): number {
    const entry: undefined | number = env.bindings.get(name);
    if (entry !== undefined) {
        return entry;
    }
    else {
        if (env.parent !== undefined) {
            return lookup(name, env.parent);
        }
        else {
            throw new Error(`variable with name ${name} is undefined`)
        }
    }
}

export function resolve_references(ast: Flat_AST): Flat_AST {
    let copy = ast.map(x => x);
    let env = make_env();

    return resolve(copy[0], copy, env);
}

function resolve(expr: Flat_Expression, ast: Flat_AST, env: LookupTable): Flat_AST {
    if (is_literal(expr, ast) || is_binding(expr, ast) || is_reference(expr, ast)) {
        return ast;
    }
    else if (is_identifier(expr, ast)) {
        // TODO: lookup name and replace this node
        const current_id: number                = expr.id;
        const current_token: undefined | number = expr.token;
        const target_id: number                 = lookup(expr.name, env);
        const ref: Flat_Reference               = { id: current_id, token: current_token, kind: "Flat_Reference", target: {id: target_id} };
        ast[current_id]                         = ref;
        return ast;
    }
    else if (is_lambda(expr, ast)) {
        const binding_node: Flat_Binding = ast[expr.binding.id] as Flat_Binding;
        const body_node: Flat_Expression = ast[expr.body.id];

        let extended_env = extend_env(env);
        extended_env.bindings.set(binding_node.name, binding_node.id);

        ast = resolve(body_node, ast, extended_env);
        return ast;
    }
    else if (is_let(expr, ast)) {
        const binding_node: Flat_Binding  = ast[expr.binding.id] as Flat_Binding;
        const value_node: Flat_Expression = ast[expr.value.id];
        const body_node: Flat_Expression  = ast[expr.body.id];

        let extended_env = extend_env(env);
        extended_env.bindings.set(binding_node.name, binding_node.id);

        ast = resolve(value_node, ast, env); // the value is evaluated with the original env
        ast = resolve(body_node, ast, extended_env);
        return ast;
    }
    else if (is_call(expr, ast)) {
        const fn_node  = ast[expr.body.id];
        const arg_node = ast[expr.arg.id];

        ast = resolve(fn_node, ast, env);
        ast = resolve(arg_node, ast, env);
        return ast;
    }
    else {
        throw Error(`Reference resolution not implemented for node ${expr.id} of kind ${expr.kind}`)
    }
}
