// Copyright (c) 2025 Marco Nikander

import { Item } from "../item";
import { Flat_Binding, Flat_Reference, Flat_Expression, Flat_AST, Flat_Builtin, is_literal, is_identifier, is_reference, is_lambda, is_let, is_call, is_binding } from "./flat_ast";

export type GlobalScope = {
    kind: "GlobalScope"
    bindings: Map<string, ("builtin")>;
};

export type Scope = {
    kind: "Scope"
    parent: Scope | GlobalScope,
    bindings: Map<string, number>,
};

export function resolve_names(ast: Flat_AST): Flat_AST {
    let copy: Flat_AST     = ast.map(x => x);
    let scope: GlobalScope = make_global_scope();
    return resolve(copy[0], copy, scope);
}

function resolve(expr: Flat_Expression, ast: Flat_AST, scope: GlobalScope | Scope): Flat_AST {
    if (is_literal(expr, ast) || is_binding(expr, ast) || is_reference(expr, ast)) {
        return ast;
    }
    else if (is_identifier(expr, ast)) {
        const current_id: number                = expr.id;
        const current_token: undefined | number = expr.token;
        const target_id: "builtin" | number     = lookup(expr.name, scope);
        if (target_id === "builtin") {
            const builtin: Flat_Builtin = { id: current_id, token: current_token, kind: "Flat_Builtin", name: expr.name };
            ast[current_id]             = builtin;
        }
        else {
            const ref: Flat_Reference = { id: current_id, token: current_token, kind: "Flat_Reference", target: {id: target_id} };
            ast[current_id]           = ref;
        }
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

export function lookup(name: string, scope: GlobalScope | Scope): "builtin" | number {
    if (is_global_scope(scope)) {
        const entry: undefined | "builtin" = scope.bindings.get(name);
        if (entry !== undefined) {
            return entry;
        }
        else {
            throw new Error(`variable with name ${name} is undefined`)
        }
    }
    else if (is_local_scope(scope)) {
        const entry: undefined | number = scope.bindings.get(name);
        if (entry !== undefined) {
            return entry;
        }
        else {
            return lookup(name, scope.parent);
        }
    }
    else {
        throw Error('Invalid kind of scope. Something is wrong with the reference resolution implementation.')
    }
}

function is_global_scope(item: Item): item is GlobalScope { return item.kind === "GlobalScope"; }
function is_local_scope(item: Item): item is Scope { return item.kind === "Scope"; }
function extend_scope(scope: GlobalScope | Scope): Scope { return { kind: "Scope", parent: scope, bindings: new Map<string, number>()}; }
function make_global_scope(): GlobalScope {
    const builtins = ["==" , "!=" , "<" , ">" , "<=" , ">=" , "+" , "-" , "*" , "/" , "%" , "~" , "&&" , "||" , "!"];
    let globals    = new Map<string, "builtin">();
    for (let b of builtins) {
        globals.set(b, "builtin");
    }
    return { kind: "GlobalScope", bindings: globals};
}
