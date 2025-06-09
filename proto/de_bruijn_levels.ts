// Copyright (c) 2025 Marco Nikander

export type AST                 = Leaf | Abstraction | DeBruijnAbstraction | Application;
export type Leaf                = number | string | { level: number }
export type Abstraction         = ['lambda', string, AST];
export type DeBruijnAbstraction = ['lambda', AST];
export type Application         = [AST, AST];

export function debruijn(expr: AST, level: number = 0): AST {
    if (is_application(expr)) {
        return [debruijn(expr[0]), expr[1]];
    }
    else if (is_abstraction(expr)) {
        const tail = replace_symbol_with_level(expr[2], expr[1], level);
        return ['lambda', debruijn(tail, level+1)];
    }
    else {
        return expr;
    }
}

function replace_symbol_with_level(expr: AST, symbol: string, level: number) {
    if (is_abstraction(expr)) { // nested lambda
        const parameter = expr[1];
        const body      = expr[2];
        if (parameter === symbol) {
            // variable is being shadowed, don't make any further substitutions, just return the expression as it is
            return ['lambda', parameter, body];
        }
        else {
            // leave the other variable in tact, proceed down the chain to replace the current variable everywhere
            return ['lambda', parameter, replace_symbol_with_level(body, symbol, level)];
        }
    }
    else if (is_application(expr)) {
        const arg: AST = replace_symbol_with_level(expr[1], symbol, level);
        const fn:  AST = replace_symbol_with_level(expr[0], symbol, level);
        return [fn, arg];
    }
    else {
        if (expr === symbol) {
            return { level: level };
        }
        else {
            return expr;
        }
    }
}

export function evaluate(lambda_expression: AST, params: number[] = []): number {
    const expr = debruijn(lambda_expression, 0);
    return evaluate_debruijn(expr, []);
}

function evaluate_debruijn(expr: AST, params: number[] = []): number {
    if (is_application(expr)) {
        if (is_number(expr[1])) {
            params.push(expr[1]);
            return evaluate_debruijn(expr[0], params);
        }
        else {
            throw new Error('Argument is of non-integer type');
        }
    }
    else if (is_debruijn_abstraction(expr)) {
        return evaluate_debruijn(expr[1], params);
    }
    else if (!Array.isArray(expr)) {
        if (typeof expr === 'object' && 'level' in expr) {
            return params[expr.level];
        }
        else if (typeof expr === 'number') {
            return expr;
        }
        else {
            throw new Error('Invalid expression type');
        }
    }
    else {
        throw new Error('Invalid array expression');
    }
}

function is_abstraction(expr: AST): expr is Abstraction {
    return Array.isArray(expr) && expr.length === 3 && expr[0] === 'lambda';
}

function is_debruijn_abstraction(expr: AST): expr is Abstraction {
    return Array.isArray(expr) && expr.length === 2 && expr[0] === 'lambda';
}

function is_application(expr: AST): expr is Application {
    return Array.isArray(expr) && expr.length === 2 && expr[0] !== 'lambda';
}

function is_number(expr: AST): expr is number {
    return typeof expr === 'number';
}
