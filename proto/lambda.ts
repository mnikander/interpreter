// Copyright (c) 2025 Marco Nikander

export type Kinds      = 'Value' | 'Identifier' | 'Reference' | 'Lambda' | 'Let' | 'Call';
export type Id         = {id: number};
export type Value      = {id: number, kind: 'Value', value: (boolean | number)};
export type Identifier = {id: number, kind: 'Identifier', name: string};
export type Reference  = {id: number, kind: 'Reference', target: Id};
export type Lambda     = {id: number, kind: 'Lambda', binding: Id, body: Id};
export type Let        = {id: number, kind: 'Let', binding: Id, value: Id, body: Id};
export type Call       = {id: number, kind: 'Call', body: Id, args: Id};
export type Node       = Value | Identifier | Reference | Lambda | Let | Call;
export type AST        = Node[];

export function is_value(expr: Node, ast: AST): expr is Value { return expr.kind === 'Value'; }
export function is_identifier(expr: Node, ast: AST): expr is Identifier { return expr.kind === 'Identifier'; }
export function is_reference(expr: Node, ast: AST): expr is Reference { return expr.kind === 'Reference'; }
export function is_lambda(expr: Node, ast: AST): expr is Lambda { return expr.kind === 'Lambda'; }
export function is_let(expr: Node, ast: AST): expr is Let { return expr.kind === 'Let'; }
export function is_call(expr: Node, ast: AST): expr is Call { return expr.kind === 'Call'; }

export type Environment = {
    parent: undefined | Environment,
    symbols: Map<string, Value>,
};

// TODO: `, env: Environment`
export function evaluate(expr: Node, ast: AST): boolean | number | string {
    if (is_value(expr, ast)) {
        return expr.value;
    }
    else if (is_identifier(expr, ast)) {
        return 0; // TODO: lookup in environment
    }
    else if (is_reference(expr, ast)) {
        return 0; // TODO
    }
    else if (is_lambda(expr, ast)) {
        return 0; // TODO
    }
    else if (is_let(expr, ast)) {
        return 0; // TODO
    }
    else if (is_call(expr, ast)) {
        return 0; // TODO
    }
    else {
        throw new Error("unhandled case in evaluation control flow");
    }
}

// TODO: add support for builtin functions with different arities
// '!'
// '+' | '-' | '*' | '/' | '%' | '<' | '>' | '<=' | '>=' | '==' | '!=' | '&' | '|' 
// 'if'
