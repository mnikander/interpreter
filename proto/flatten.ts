// Copyright (c) 2025 Marco Nikander

import { AST, is_boolean, is_call, is_identifier, is_lambda, is_let, is_number, is_string } from "../src/ast";
import { Value, Id, Flat_Constant, Flat_Identifier, Flat_Reference, Flat_Lambda, Flat_Let, Flat_Call, Flat_Plus, Flat_Minus, Flat_Node, Flat_Atom, Flat_AST } from "./flat_ast";

export function flatten(ast: AST, node_count: number): Flat_AST {
    const flat: Flat_Node[] = Array(node_count);
    return flatten_nodes(ast, flat);
}

function flatten_nodes(nested_ast: AST, flat_ast: Flat_AST): Flat_AST {
    if (is_lambda(nested_ast)) {
        const index               = nested_ast.id;
        const binding_id          = { id: nested_ast.data[1].id };
        const body_id             = { id: nested_ast.data[2].id };
        let node: Flat_Lambda     = { id: index, token: nested_ast.token, kind: 'Flat_Lambda', binding: binding_id, body: body_id };
        flat_ast[index]           = node;
        flat_ast                  = flatten_nodes(nested_ast.data[1], flat_ast);
        flat_ast                  = flatten_nodes(nested_ast.data[2], flat_ast);
    }
    else if (is_let(nested_ast)) {
        const index               = nested_ast.id;
        const binding_id          = { id: nested_ast.data[1].id };
        const value_id            = { id: nested_ast.data[2].id };
        const body_id             = { id: nested_ast.data[3].id };
        let node: Flat_Let        = { id: index, token: nested_ast.token, kind: 'Flat_Let', binding: binding_id, value: value_id, body: body_id };
        flat_ast[index]           = node;
        flat_ast                  = flatten_nodes(nested_ast.data[1], flat_ast);
        flat_ast                  = flatten_nodes(nested_ast.data[2], flat_ast);
        flat_ast                  = flatten_nodes(nested_ast.data[3], flat_ast);
    }
    else if (is_call(nested_ast)) {
        const index               = nested_ast.id;
        const body_id             = { id: nested_ast.data[0].id };
        const arg_id              = { id: nested_ast.data[1].id };
        let node: Flat_Call       = { id: index, token: nested_ast.token, kind: 'Flat_Call', body: body_id, arg: arg_id };
        flat_ast[index]           = node;
        flat_ast                  = flatten_nodes(nested_ast.data[0], flat_ast);
        flat_ast                  = flatten_nodes(nested_ast.data[1], flat_ast);
    }
    else if (is_boolean(nested_ast) || is_number(nested_ast) || is_string(nested_ast)) {
        const index               = nested_ast.id;
        let node: Flat_Constant   = { id: index, token: nested_ast.token, kind: 'Flat_Constant', value: nested_ast.value };
        flat_ast[index]           = node;
    }
    else if (is_identifier(nested_ast)) {
        const index               = nested_ast.id;
        let node: Flat_Identifier = { id: index, token: nested_ast.token, kind: 'Flat_Identifier', name: nested_ast.value };
        flat_ast[index]           = node;
    }
    else {
        throw Error(`Cannot convert node of kind '${nested_ast.kind}' to a flat node kind.`);
    }

    return flat_ast;
}
