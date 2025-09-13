// Copyright (c) 2025 Marco Nikander

export type Value           = boolean | number;
export type Id              = {id: number};
export type Flat_Literal    = {id: number, token: number, kind: 'Flat_Literal', value: (boolean | number | string)};
export type Flat_Identifier = {id: number, token: number, kind: 'Flat_Identifier', name: string};
export type Flat_Reference  = {id: number, token: number, kind: 'Flat_Reference', target: Id};
export type Flat_Lambda     = {id: number, token: number, kind: 'Flat_Lambda', binding: Id, body: Id};
export type Flat_Let        = {id: number, token: number, kind: 'Flat_Let', binding: Id, value: Id, body: Id};
export type Flat_Call       = {id: number, token: number, kind: 'Flat_Call', body: Id, arg: Id};
export type Flat_Plus       = {id: number, token: number, kind: 'Flat_Plus'};
export type Flat_Minus      = {id: number, token: number, kind: 'Flat_Minus'};
export type Flat_Node       = Flat_Literal | Flat_Identifier | Flat_Reference | Flat_Lambda | Flat_Let | Flat_Call | Flat_Plus | Flat_Minus;
export type Flat_Atom       = Flat_Literal | Flat_Identifier;
export type Flat_AST        = Flat_Node[];

// TODO: implement built-in functions capable of partial application
//       and give them pre-reserved IDs

export function is_literal(expr: Flat_Node, ast: Flat_AST): expr is Flat_Literal { return expr.kind === 'Flat_Literal'; }
export function is_identifier(expr: Flat_Node, ast: Flat_AST): expr is Flat_Identifier { return expr.kind === 'Flat_Identifier'; }
export function is_reference(expr: Flat_Node, ast: Flat_AST): expr is Flat_Reference { return expr.kind === 'Flat_Reference'; }
export function is_lambda(expr: Flat_Node, ast: Flat_AST): expr is Flat_Lambda { return expr.kind === 'Flat_Lambda'; }
export function is_let(expr: Flat_Node, ast: Flat_AST): expr is Flat_Let { return expr.kind === 'Flat_Let'; }
export function is_call(expr: Flat_Node, ast: Flat_AST): expr is Flat_Call { return expr.kind === 'Flat_Call'; }
export function is_plus(expr: Flat_Node, ast: Flat_AST): expr is Flat_Plus { return expr.kind === 'Flat_Plus'; }
export function is_minus(expr: Flat_Node, ast: Flat_AST): expr is Flat_Minus { return expr.kind === 'Flat_Minus'; }
