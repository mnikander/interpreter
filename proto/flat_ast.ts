// Copyright (c) 2025 Marco Nikander

import { Token, TokenBoolean, TokenNumber, TokenString, TokenIdentifier } from "./../src/token";

export type Id         = {id: number};
export type Constant   = {id: number, token: number, kind: 'Constant', value: (boolean | number | string)};
export type Identifier = {id: number, token: number, kind: 'Identifier', name: string};
export type Reference  = {id: number, token: number, kind: 'Reference', target: Id};
export type Lambda     = {id: number, token: number, kind: 'Lambda', binding: Id, body: Id};
export type Let        = {id: number, token: number, kind: 'Let', binding: Id, value: Id, body: Id};
export type Call       = {id: number, token: number, kind: 'Call', body: Id, arg: Id};
export type Plus       = {id: number, token: number, kind: 'Plus'};
export type Minus      = {id: number, token: number, kind: 'Minus'};
export type Node       = Constant | Identifier | Reference | Lambda | Let | Call | Plus | Minus;
export type Atom       = Constant | Identifier;
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

// constructors

export function make_call(node_counter: number, token: Token, body: Id, arg: Id): Call {
    return { id: node_counter, token: token.id, kind: "Call", body: body, arg: arg };
}
