// Copyright (c) 2025 Marco Nikander

export type Id              = {id: number};
export type Flat_AST        = Flat_Expression[];
export type Flat_Expression = Flat_Literal | Flat_Identifier | Flat_Binding | Flat_Reference | Flat_Builtin | Flat_Lambda | Flat_Let | Flat_If | Flat_Call;
export type Flat_Literal    = {id: number, token?: number, tag: 'Flat_Literal', value: (boolean | number | string)};
export type Flat_Identifier = {id: number, token?: number, tag: 'Flat_Identifier', name: string};
export type Flat_Binding    = {id: number, token?: number, tag: 'Flat_Binding', name: string};
export type Flat_Reference  = {id: number, token?: number, tag: 'Flat_Reference', target: Id};
export type Flat_Lambda     = {id: number, token?: number, tag: 'Flat_Lambda', binding: Id, body: Id};
export type Flat_Let        = {id: number, token?: number, tag: 'Flat_Let', binding: Id, value: Id, body: Id};
export type Flat_If         = {id: number, token?: number, tag: 'Flat_If', condition: Id, if_true: Id, if_false: Id};
export type Flat_Call       = {id: number, token?: number, tag: 'Flat_Call', body: Id, arg: Id};
export type Flat_Builtin    = {id: number, token?: number, tag: 'Flat_Builtin', name: "==" | "!=" | "<" | ">" | "<=" | ">=" | "+" | "-" | "*" | "/" | "%" | "~" | "&&" | "||" | "!"};

export const builtins: readonly string[] = ["==" , "!=" , "<" , ">" , "<=" , ">=" , "+" , "-" , "*" , "/" , "%" , "~" , "&&" , "||" , "!"];

export function is_literal(expr: Flat_Expression, ast: Flat_AST): expr is Flat_Literal { return expr.tag === 'Flat_Literal'; }
export function is_identifier(expr: Flat_Expression, ast: Flat_AST): expr is Flat_Identifier { return expr.tag === 'Flat_Identifier'; }
export function is_binding(expr: Flat_Expression, ast: Flat_AST): expr is Flat_Binding { return expr.tag === 'Flat_Binding'; }
export function is_reference(expr: Flat_Expression, ast: Flat_AST): expr is Flat_Reference { return expr.tag === 'Flat_Reference'; }
export function is_lambda(expr: Flat_Expression, ast: Flat_AST): expr is Flat_Lambda { return expr.tag === 'Flat_Lambda'; }
export function is_let(expr: Flat_Expression, ast: Flat_AST): expr is Flat_Let { return expr.tag === 'Flat_Let'; }
export function is_if(expr: Flat_Expression, ast: Flat_AST): expr is Flat_If { return expr.tag === 'Flat_If'; }
export function is_call(expr: Flat_Expression, ast: Flat_AST): expr is Flat_Call { return expr.tag === 'Flat_Call'; }
export function is_builtin(expr: Flat_Expression, ast: Flat_AST): expr is Flat_Builtin { return expr.tag === 'Flat_Builtin'; }
