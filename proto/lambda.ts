// Copyright (c) 2025 Marco Nikander

export type meta       = {kind: ('Value' | 'Identifier' | 'Reference' | 'Lambda' | 'Let' | 'Call'), id: number};
export type Value      = [meta, (boolean | number)];
export type Identifier = [meta, string];
export type Reference  = [meta, {target: number}]
export type Lambda     = [meta, 'lambda', Identifier, Expression];
export type Let        = [meta, 'let', Identifier, Expression, Expression];
export type Call       = [meta, Expression, (Expression | Expression[])]
export type Expression = Value | Identifier | Reference | Lambda | Let | Call;

export function is_value(expr: Expression): expr is Value { return expr[0].kind === 'Value'; }
export function is_identifier(expr: Expression): expr is Identifier { return expr[0].kind === 'Identifier'; }
export function is_reference(expr: Expression): expr is Reference { return expr[0].kind === 'Reference'; }
export function is_lambda(expr: Expression): expr is Lambda { return expr[0].kind === 'Lambda'; }
export function is_let(expr: Expression): expr is Let { return expr[0].kind === 'Let'; }
export function is_call(expr: Expression): expr is Call { return expr[0].kind === 'Call'; }

// TODO: try refactoring this prototype to use a flat array representation of the AST, instead of a tree structure, to make dereferencing easy
/*
TREE:

[
    {kind: 'Call', id: 0},
    [
        {kind: 'Lambda', id: 1},
        'lambda',
        [{kind: 'Identifier', id: 2}, 'x'],
        [{kind: 'Reference', id: 3}, {target: 2}]
    ],
    [{kind: 'Value', id: 4}, 1]
];

ARRAY:

[
    {id: 0, kind: 'Call', fn: {node: 1}, args: {node: 4}],
    {id: 1, kind: 'Lambda', binding: {node: 2}, body: {node: 3}],
    {id: 2, kind: 'Identifier', name: 'x'],
    {id: 3, kind: 'Reference', target: {node: 2}]
    {id: 4, kind: 'Value', value: 1]
];
*/

export type Environment = {
    parent: undefined | Environment,
    symbols: Map<string, Value>,
};

// TODO: `, env: Environment`
export function evaluate(expr: Expression): boolean | number | string {
    if (is_value(expr)) {
        return expr[1];
    }
    else if (is_identifier(expr)) {
        return 0; // TODO: lookup in environment
    }
    else if (is_lambda(expr)) {
        return 0; // TODO
    }
    else if (is_let(expr)) {
        return 0; // TODO
    }
    else if (is_call(expr)) {
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
