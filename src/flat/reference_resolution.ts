// Copyright (c) 2025 Marco Nikander

import { Flat_Binding, Flat_Reference, Flat_Expression, Flat_AST, is_literal, is_identifier, is_reference, is_lambda, is_let, is_call, is_plus, is_minus, is_binding } from "./flat_ast";

export type Scope = {
    parent: undefined | Scope,
    bindings: Map<string, number>,
};

export function make_scope(): Scope { return { parent: undefined, bindings: new Map<string, number>()} }

function extend_scope(scope: Scope): Scope { return { parent: scope, bindings: new Map<string, number>()}; }

export function lookup(name: string, scope: Scope): number {
    const entry: undefined | number = scope.bindings.get(name);
    if (entry !== undefined) {
        return entry;
    }
    else {
        if (scope.parent !== undefined) {
            return lookup(name, scope.parent);
        }
        else {
            throw new Error(`variable with name ${name} is undefined`)
        }
    }
}

export function resolve_references(ast: Flat_AST): Flat_AST {
    let copy = ast.map(x => x);
    let scope = make_scope();

    return resolve(copy[0], copy, scope);
}

function resolve(expr: Flat_Expression, ast: Flat_AST, scope: Scope): Flat_AST {
    if (is_literal(expr, ast) || is_binding(expr, ast) || is_reference(expr, ast)) {
        return ast;
    }
    else if (is_identifier(expr, ast)) {
        const current_id: number                = expr.id;
        const current_token: undefined | number = expr.token;
        const target_id: number                 = lookup(expr.name, scope);
        const ref: Flat_Reference               = { id: current_id, token: current_token, kind: "Flat_Reference", target: {id: target_id} };
        ast[current_id]                         = ref;
        return ast;
    }
    else if (is_lambda(expr, ast)) {
        const binding_node: Flat_Binding = ast[expr.binding.id] as Flat_Binding;
        const body_node: Flat_Expression = ast[expr.body.id];

        let extended_scope = extend_scope(scope);
        extended_scope.bindings.set(binding_node.name, binding_node.id);

        ast = resolve(body_node, ast, extended_scope);
        return ast;
    }
    else if (is_let(expr, ast)) {
        const binding_node: Flat_Binding  = ast[expr.binding.id] as Flat_Binding;
        const value_node: Flat_Expression = ast[expr.value.id];
        const body_node: Flat_Expression  = ast[expr.body.id];

        let extended_scope = extend_scope(scope);
        extended_scope.bindings.set(binding_node.name, binding_node.id);

        ast = resolve(value_node, ast, scope); // the value is evaluated with the original scope
        ast = resolve(body_node, ast, extended_scope);
        return ast;
    }
    else if (is_call(expr, ast)) {
        const fn_node  = ast[expr.body.id];
        const arg_node = ast[expr.arg.id];

        ast = resolve(fn_node, ast, scope);
        ast = resolve(arg_node, ast, scope);
        return ast;
    }
    else {
        throw Error(`Reference resolution not implemented for node ${expr.id} of kind ${expr.kind}`)
    }
}
