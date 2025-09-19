// Copyright (c) 2025 Marco Nikander

import { Flat_Builtin, Flat_AST, Value } from "./flat_ast";
import { Environment } from "./lambda";

export function evaluate_builtin(expr: Flat_Builtin, ast: Flat_AST, env: Environment, stacked_args: Value[]): Value {
    if(is_builtin_unary(expr)) {
        return evaluate_unary(expr, ast, env, stacked_args);
    }
    else if (is_builtin_binary(expr)) {
        return evaluate_binary(expr, ast, env, stacked_args);
    }
    throw Error(`The evaluation of the built-in function '${expr.name} has not been implemented.`);
}

function evaluate_unary(expr: Flat_Builtin, ast: Flat_AST, env: Environment, stacked_args: Value[]): Value {
    if (stacked_args.length < 1) {
        throw Error(`Stack contains ${stacked_args.length} arguments, but expected 1 for the unary operation ${expr.name}.`)
    }
    const first = stacked_args.pop();
    
    if(is_builtin_negative(expr)) {
        // do a dynamic type-check, just in case
        if (typeof first !== "number") {
            throw Error("Built-in negative operation only supports numbers");
        }
        else {
            return -first;
        }
    }
    else if (is_builtin_not(expr)) {
        // do a dynamic type-check, just in case
        if (typeof first !== "boolean") {
            throw Error("Built-in logical not operation only supports booleans");
        }
        else {
            return !first;
        }
    }
    else {
        throw Error(`The evaluation of the unary built-in function '${expr.name} has not been implemented.`);
    }
}

function evaluate_binary(expr: Flat_Builtin, ast: Flat_AST, env: Environment, stacked_args: Value[]): Value {
    if (stacked_args.length < 2) {
        throw Error(`Stack contains ${stacked_args.length} arguments, but expected 2 for the binary operation ${expr.name}.`)
    }
    const first = stacked_args.pop();
    const second = stacked_args.pop();

    if (first === undefined) {
        throw Error(`First argument of ${expr.name} is undefined`);
    }
    if (second === undefined) {
        throw Error(`Second argument of ${expr.name} is undefined`);
    }

    if (is_builtin_equality(expr)) {
        switch (expr.name) {
            case '==':
                return first == second;
            case '!=':
                return first != second;
            default:
                throw Error(`Cannot evaluate binary operation '${expr.name}' at token ${expr.token}`);
        }
    }
    else if (is_builtin_comparison(expr) || is_builtin_arithmetic(expr)) {
        if (typeof first !== "number" || typeof second !== "number") {
            throw Error("Built-in comparison/arithmetic operations only support numbers");
        }
        switch (expr.name) {
            case '<':
                return first < second;
            case '>':
                return first > second;
            case '<=':
                return first <= second;
            case '>=':
                return first >= second;
            case '+':
                return first + second;
            case '-':
                return first - second;
            case '*':
                return first * second;
            case '/':
                return first / second;
            case '%':
                return first % second;
            default:
                throw Error(`Cannot evaluate binary operation '${expr.name}' at token ${expr.token}`);
        }
    }
    else if (is_builtin_logical(expr)) {
        if (typeof first !== "boolean" || typeof second !== "boolean") {
            throw Error("Built-in logical operations only support booleans");
        }
        switch (expr.name) {
            case '&&':
                return first && second; 
            case '||':
                return first || second;
            default:
                throw Error(`Cannot evaluate binary operation '${expr.name}' at token ${expr.token}`);
        }
    }
    throw Error(`The evaluation of the binary built-in function '${expr.name} has not been implemented.`);
}

function is_builtin_unary(expr: Flat_Builtin): boolean {
    return is_builtin_not(expr) || is_builtin_negative(expr);
}

function is_builtin_binary(expr: Flat_Builtin): boolean {
    return is_builtin_equality(expr) || is_builtin_comparison(expr) || is_builtin_arithmetic(expr) || is_builtin_logical(expr);
}

function is_builtin_equality(expr: Flat_Builtin): boolean {
    return expr.name === "=="
        || expr.name === "!=";
}

function is_builtin_comparison(expr: Flat_Builtin): boolean {
    return expr.name === "<"
        || expr.name === ">"
        || expr.name === "<="
        || expr.name === ">=";
}

function is_builtin_arithmetic(expr: Flat_Builtin): boolean {
    return expr.name === "+"
        || expr.name === "-"
        || expr.name === "*"
        || expr.name === "/"
        || expr.name === "%";
}

function is_builtin_negative(expr: Flat_Builtin): boolean {
    return expr.name === "~";
}

function is_builtin_logical(expr: Flat_Builtin): boolean {
    return expr.name === "&&"
        || expr.name === "||";
}

function is_builtin_not(expr: Flat_Builtin): boolean {
    return expr.name === "!";
}
