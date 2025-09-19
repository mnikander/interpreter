// Copyright (c) 2025 Marco Nikander

import { Flat_Builtin, Flat_AST, Value } from "./flat_ast";
import { Environment } from "./lambda";

export function evaluate_builtin(expr: Flat_Builtin, ast: Flat_AST, env: Environment, stacked_args: Value[]): Value {
    if(is_builtin_unary(expr)) {
        let first = stacked_args.pop();
        
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
    }
    else if (is_builtin_binary(expr)) {
        let first = stacked_args.pop();
        let second = stacked_args.pop();

        // do a dynamic type-check, just in case
        if (is_builtin_comparison(expr) || is_builtin_arithmetic(expr)) {
            if (typeof first !== "number" || typeof second !== "number") {
                throw Error("Built-in comparison/arithmetic operations only support numbers");
            }
        else if (is_builtin_logical(expr)) {
            if (typeof first !== "boolean" || typeof second !== "boolean") {
                throw Error("Built-in logical operations only support booleans");
            }
        }

        switch (expr.name) {
            case '==':
                return first == second;
            case '!=':
                return first != second;
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
            case '&&':
                return first && second; 
            case '||':
                return first || second;
            default:
                throw new Error(`Binary builtin '${expr.name}' not implemented in evaluate_builtin`);
            }   
        }
    }
    throw Error(`The evaluation of the built-in function '${expr.name} has not been implemented.`);
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
