// Copyright (c) 2025 Marco Nikander

import { is_nd_boolean, is_nd_number, is_nd_identifier, is_nd_call, Node, NodeAtom, NodeCall, NodeIdentifier, NodeBoolean, NodeNumber} from "./parser";

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

export function lookup(identifier: NodeIdentifier, environment: Map<string, SymbolEntry>): undefined | SymbolEntry {
    return environment.get(identifier.value);
}

export function evaluate(ast: Node): EvaluationError | SymbolEntry | EvaluationValue {
    // hardcode the use of a single constant OR addition
    if (is_nd_boolean(ast)) {
        return {kind: 'EV_VALUE', value: (ast as NodeBoolean).value} as EvaluationValue;
    }
    else if (is_nd_number(ast)) {
        return {kind: 'EV_VALUE', value: (ast as NodeNumber).value} as EvaluationValue;
    }
    else if (is_nd_identifier(ast)) {
        const identifier = ast as NodeIdentifier;
        const target     = lookup(identifier, environment);
        if (target !== undefined) {
            return target;
        } else {
            return {kind: "EV_ERROR", message: `unknown identifier '${identifier.value}'`} as EvaluationError;
        }
    }
    else if (is_nd_call(ast)) {
        const call: NodeCall = ast as NodeCall;
        const identifier: undefined | SymbolEntry = lookup(call.func as NodeIdentifier, environment);
        if(identifier?.kind === "EV_FUNCTION") {
            if(identifier.arity == 1 && call.params.length == 1) {
                const left = evaluate(call.params[0]);
                if (left.kind === "EV_VALUE") {
                    const f = identifier.value as Function;
                    const l = (left as EvaluationValue).value;
                    return {kind: "EV_VALUE", value: f(l)} as EvaluationValue;
                }
                else {
                    return left;
                }
            }
            if(identifier.arity == 2 && call.params.length == 2) {
                const left = evaluate(call.params[0]);
                const right = evaluate(call.params[1]);
                if (left.kind === "EV_VALUE") {
                    if (right.kind === "EV_VALUE") {
                    const f = identifier.value as Function;
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
                return {kind: "EV_ERROR", message: `${call.params.length} argument(s) provided, expected ${identifier.arity}`} as EvaluationError;
            }
        }
        else {
            return {kind: "EV_ERROR", message: `expected a function identifier, got '${(call.func as (NodeBoolean | NodeNumber | NodeIdentifier)).value}'`} as EvaluationError;
        }
    }
    return {kind: "EV_ERROR", message: `invalid expression`} as EvaluationError;
}
