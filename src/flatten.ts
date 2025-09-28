// Copyright (c) 2025 Marco Nikander

import { Item } from "./item";
import { Nested_Expression, is_boolean, is_call, is_identifier, is_binding, is_lambda, is_let, is_if, is_number, is_string } from "./parser";
import { Flat_Literal, Flat_Identifier, Flat_Lambda, Flat_Let, Flat_Call, Flat_Expression, Flat_AST, Flat_Binding, Flat_If } from "./flat_ast";

export function flatten(ast: Nested_Expression, node_count: number): Flat_AST {
    const flat: Flat_Expression[] = Array(node_count);
    return flatten_nodes(ast, flat);
}

function flatten_nodes(nested_ast: Nested_Expression, flat_ast: Flat_AST): Flat_AST {
    if (is_lambda(nested_ast)) {
        const index               = nested_ast.id;
        const binding_id          = { id: nested_ast.binding.id };
        const body_id             = { id: nested_ast.body.id };
        let node: Flat_Lambda     = { id: index, token: nested_ast.token, tag: 'Flat_Lambda', binding: binding_id, body: body_id };
        flat_ast[index]           = node;
        flat_ast                  = flatten_nodes(nested_ast.binding, flat_ast);
        flat_ast                  = flatten_nodes(nested_ast.body, flat_ast);
    }
    else if (is_let(nested_ast)) {
        const index               = nested_ast.id;
        const binding_id          = { id: nested_ast.binding.id };
        const value_id            = { id: nested_ast.value.id };
        const body_id             = { id: nested_ast.body.id };
        let node: Flat_Let        = { id: index, token: nested_ast.token, tag: 'Flat_Let', binding: binding_id, value: value_id, body: body_id };
        flat_ast[index]           = node;
        flat_ast                  = flatten_nodes(nested_ast.binding, flat_ast);
        flat_ast                  = flatten_nodes(nested_ast.value, flat_ast);
        flat_ast                  = flatten_nodes(nested_ast.body, flat_ast);
    }
    else if (is_if(nested_ast)) {
        const index               = nested_ast.id;
        const condition           = { id: nested_ast.condition.id }; 
        const then_branch             = { id: nested_ast.then_branch.id };
        const else_branch            = { id: nested_ast.else_branch.id };
        let node: Flat_If         = { id: index, token: nested_ast.token, tag: 'Flat_If', condition: condition, then_branch: then_branch, else_branch: else_branch };
        flat_ast[index]           = node;
        flat_ast                  = flatten_nodes(nested_ast.condition, flat_ast);
        flat_ast                  = flatten_nodes(nested_ast.then_branch, flat_ast);
        flat_ast                  = flatten_nodes(nested_ast.else_branch, flat_ast);
    }
    else if (is_call(nested_ast)) {
        const index               = nested_ast.id;
        const body_id             = { id: nested_ast.fn.id };
        const arg_id              = { id: nested_ast.arg.id };
        let node: Flat_Call       = { id: index, token: nested_ast.token, tag: 'Flat_Call', body: body_id, arg: arg_id };
        flat_ast[index]           = node;
        flat_ast                  = flatten_nodes(nested_ast.fn, flat_ast);
        flat_ast                  = flatten_nodes(nested_ast.arg, flat_ast);
    }
    else if (is_boolean(nested_ast) || is_number(nested_ast) || is_string(nested_ast)) {
        const index               = nested_ast.id;
        let node: Flat_Literal   = { id: index, token: nested_ast.token, tag: 'Flat_Literal', value: nested_ast.value };
        flat_ast[index]           = node;
    }
    else if (is_identifier(nested_ast)) {
        const index               = nested_ast.id;
        let node: Flat_Identifier = { id: index, token: nested_ast.token, tag: 'Flat_Identifier', name: nested_ast.name };
        flat_ast[index]           = node;
    }
    else if (is_binding(nested_ast)) {
        const index               = nested_ast.id;
        let node: Flat_Binding = { id: index, token: nested_ast.token, tag: 'Flat_Binding', name: nested_ast.name };
        flat_ast[index]           = node;
    }
    else {
        throw Error(`Cannot convert nested node of tag '${(nested_ast as Item).tag}' to a corresponding tag of flat node.`);
    }

    return flat_ast;
}
