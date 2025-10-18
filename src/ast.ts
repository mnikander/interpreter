// Copyright (c) 2025 Marco Nikander

import { Item } from "./item";

export type _Expression = _LetBind | _Tail;
export type _Literal    = _Boolean | _Number | _String;
export type _Tail       = _Atomic  | _Call   | _Complex;
export type _Atomic     = _Literal | _Binding | _Identifier | _Lambda | _Block; 
export type _Complex    = _IfThenElse;
export type _Block      = {id?: number, token: number, tag: '_Block', body: (_LetBind | _Tail)};
export type _LetBind    = {id?: number, token: number, tag: '_LetBind', binding: _Binding, value: (_Atomic | _Call), body: (_LetBind | _Tail)};
export type _Lambda     = {id?: number, token: number, tag: '_Lambda', binding: _Binding, body: _Block};
export type _Call       = {id?: number, token: number, tag: '_Call', fn: _Atomic, arg: _Atomic};
export type _IfThenElse = {id?: number, token: number, tag: '_IfThenElse', condition: _Atomic | _Call, then_branch: _Block, else_branch: _Block};
export type _Binding    = {id?: number, token: number, tag: '_Binding', name: string};
export type _Identifier = {id?: number, token: number, tag: '_Identifier', name: string};
export type _Boolean    = {id?: number, token: number, tag: '_Boolean', value: boolean};
export type _Number     = {id?: number, token: number, tag: '_Number', value: number};
export type _String     = {id?: number, token: number, tag: '_String', value: string};

export function is_literal(expr: Item): expr is _Literal { return is_boolean(expr) || is_number(expr) || is_string(expr); }
export function is_tail(expr: Item): expr is _Tail { return is_atomic(expr) || is_call(expr) || is_complex(expr); }
export function is_atomic(expr: Item): expr is _Atomic { return is_literal(expr) || is_binding(expr) || is_identifier(expr) || is_lambda(expr) || is_block(expr); }
export function is_complex(expr: Item): expr is _Complex { return is_if(expr); }
export function is_block(expr: Item): expr is _Block { return expr.tag === '_Block'; }
export function is_let(expr: Item): expr is _LetBind { return expr.tag === '_LetBind'; }
export function is_lambda(expr: Item): expr is _Lambda { return expr.tag === '_Lambda'; }
export function is_call(expr: Item): expr is _Call { return expr.tag === '_Call'; }
export function is_if(expr: Item): expr is _IfThenElse { return expr.tag === '_IfThenElse'; }
export function is_binding(expr: Item): expr is _Binding { return expr.tag === '_Binding'; }
export function is_identifier(expr: Item): expr is _Identifier { return expr.tag === '_Identifier'; }
export function is_boolean(expr: Item): expr is _Boolean { return expr.tag === '_Boolean'; }
export function is_number(expr: Item): expr is _Number { return expr.tag === '_Number'; }
export function is_string(expr: Item): expr is _String { return expr.tag === '_String'; }

export type Visitor = {
  pre?:  (node: _Expression, context: any) => void;
  post?: (node: _Expression, context: any) => void;
};

export function walk(node: _Expression, visitor: Visitor, context: any): void {
    if (visitor.pre) {
        visitor.pre(node, context);
    }

    if (is_block(node)) {
        walk(node.body, visitor, context);
    }
    else if (is_let(node)) {
        walk(node.binding, visitor, context);
        walk(node.value, visitor, context);
        walk(node.body, visitor, context);
    }
    else if (is_lambda(node)) {
        walk(node.binding, visitor, context);
        walk(node.body, visitor, context);
    }
    else if (is_call(node)) {
        walk(node.fn, visitor, context);
        walk(node.arg, visitor, context);
    }
    else if (is_if(node)) {
        walk(node.condition, visitor, context);
        walk(node.then_branch, visitor, context);
        walk(node.else_branch, visitor, context);
    }

    if (visitor.post) {
        visitor.post(node, context);
    }
}

export function validate(id: number | undefined | null): number {
    if (id === undefined || id === null) {
        throw Error(`BUG: Expected valid id, got ${id}. This means Ids were not assigned correctly during/after parsing.`);
    }
    return id;
}
