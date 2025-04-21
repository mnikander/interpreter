// Copyright (c) 2025 Marco Nikander

import { is_nd_boolean, is_nd_number, is_nd_identifier, is_nd_call, ASTNode, ASTAtom} from "./parser";

export interface EvaluationError {
    kind: "EV_ERROR",
    message: string,
}

export interface SymbolEntry {
    kind: string,
    arity?: number,
    value: boolean | number | Function,
};

export interface EvaluationValue {
    kind: "EV_VALUE",
    value: boolean | number,
}

const environment = new Map<string, SymbolEntry>([
    ['+',  {kind: "EV_FUNCTION", arity: 2, value: function (left: number, right: number) { return left + right; }}],
    ['-',  {kind: "EV_FUNCTION", arity: 2, value: function (left: number, right: number) { return left - right; }}],
    ['*',  {kind: "EV_FUNCTION", arity: 2, value: function (left: number, right: number) { return left * right; }}],
    ['/',  {kind: "EV_FUNCTION", arity: 2, value: function (left: number, right: number) { return left / right; }}],
    ['%',  {kind: "EV_FUNCTION", arity: 2, value: function (left: number, right: number) { return left % right; }}],
    ['&',  {kind: "EV_FUNCTION", arity: 2, value: function (left: boolean, right: boolean) { return left && right; }}],
    ['|',  {kind: "EV_FUNCTION", arity: 2, value: function (left: boolean, right: boolean) { return left || right; }}],
    ['!',  {kind: "EV_FUNCTION", arity: 1, value: function (left: boolean) { return !left; }}],
]);

export function lookup(identifier: ASTAtom, environment: Map<string, SymbolEntry>): undefined | SymbolEntry {
    return environment.get(String(identifier.value));
}

export function evaluate(ast: ASTNode): EvaluationError | SymbolEntry | EvaluationValue {
    // hardcode the use of a single constant OR addition
    if (is_nd_boolean(ast)) {
        let v = (ast as {kind: "ND_BOOLEAN", value: boolean}).value;
        return {kind: 'EV_VALUE', value: v} as EvaluationValue;
    }
    else if (is_nd_number(ast)) {
        let v = (ast as {kind: "ND_NUMBER", value: number}).value;
        return {kind: 'EV_VALUE', value: v} as EvaluationValue;
    }
    else if (is_nd_identifier(ast)) {
        const identifier = ast as { kind: "ND_IDENTIFIER", value: string};
        const target     = lookup(identifier, environment);
        if (target !== undefined) {
            return target;
        } else {
            return {kind: "EV_ERROR", message: `unknown identifier '${identifier.value}'`} as EvaluationError;
        }
    }
    else if (is_nd_call(ast)) {
        const call: ASTNode = ast as { kind: "ND_CALL", func: ASTNode, params: ASTNode[]};
        const identifier: ASTNode = call.func as { kind: "ND_IDENTIFIER", value: string };
        const fn: undefined | SymbolEntry = lookup(identifier, environment);
        if(fn?.kind === "EV_FUNCTION") {
            if(fn.arity == 1 && call.params.length == 1) {
                const left = evaluate(call.params[0]);
                if (left.kind === "EV_VALUE") {
                    const f = fn.value as Function;
                    const l = (left as EvaluationValue).value;
                    return {kind: "EV_VALUE", value: f(l)} as EvaluationValue;
                }
                else {
                    return left;
                }
            }
            if(fn.arity == 2 && call.params.length == 2) {
                const left = evaluate(call.params[0]);
                const right = evaluate(call.params[1]);
                if (left.kind === "EV_VALUE") {
                    if (right.kind === "EV_VALUE") {
                    const f = fn.value as Function;
                    const l = (left as EvaluationValue).value;
                    const r = (right as EvaluationValue).value;
                    return {kind: "EV_VALUE", value: f(l, r)} as EvaluationValue;
                    }
                    else {
                        return right;
                    }
                }
                else {
                    return left;
                }
            }
            else {
                return {kind: "EV_ERROR", message: `${call.params.length} argument(s) provided, expected ${fn.arity}`} as EvaluationError;
            }
        }
        else {
            const atom = call.func as ASTAtom;
            let m: string = `expected a function identifier, got '${atom.value}'`;
            return {kind: "EV_ERROR", message: m} as EvaluationError;
        }
    }
    return {kind: "EV_ERROR", message: `invalid expression`} as EvaluationError;
}
