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
    about: string,
};

export interface EvaluationValue {
    kind: "EV_VALUE",
    value: boolean | number,
}

const environment: Map<string, SymbolEntry> = new Map<string, SymbolEntry>([
    ['+',    {kind: "EV_FUNCTION", arity: 2, value: function (left: number, right: number) { return left + right; }, about: "(+ 5 2)\t\taddition"}],
    ['-',    {kind: "EV_FUNCTION", arity: 2, value: function (left: number, right: number) { return left - right; }, about: "(- 5 2)\t\tsubtraction"}],
    ['*',    {kind: "EV_FUNCTION", arity: 2, value: function (left: number, right: number) { return left * right; }, about: "(* 5 2)\t\tmultiplication"}],
    ['/',    {kind: "EV_FUNCTION", arity: 2, value: function (left: number, right: number) { return left / right; }, about: "(/ 5 2)\t\tdivision"}],
    ['%',    {kind: "EV_FUNCTION", arity: 2, value: function (left: number, right: number) { return left % right; }, about: "(% 5 2)\t\tremainder after division"}],
    ['<',    {kind: "EV_FUNCTION", arity: 2, value: function (left: number, right: number) { return left < right; }, about: "(< 5 2)\t\tless than"}],
    ['>',    {kind: "EV_FUNCTION", arity: 2, value: function (left: number, right: number) { return left > right; }, about: "(> 5 2)\t\tgreater than"}],
    ['<=',   {kind: "EV_FUNCTION", arity: 2, value: function (left: number, right: number) { return left <= right; }, about: "(<= 5 2)\tless than or equal to"}],
    ['>=',   {kind: "EV_FUNCTION", arity: 2, value: function (left: number, right: number) { return left >= right; }, about: "(>= 5 2)\tgreater than or equal to"}],
    ['==',   {kind: "EV_FUNCTION", arity: 2, value: function (left: number, right: number) { return left == right; }, about: "(== 5 2)\tequal to"}],
    ['!=',   {kind: "EV_FUNCTION", arity: 2, value: function (left: number, right: number) { return left != right; }, about: "(!= 5 2)\tunequal to"}],
    ['&',    {kind: "EV_FUNCTION", arity: 2, value: function (left: boolean, right: boolean) { return left && right; }, about: "(& True False)\tlogical and"}],
    ['|',    {kind: "EV_FUNCTION", arity: 2, value: function (left: boolean, right: boolean) { return left || right; }, about: "(| True False)\tlogical or"}],
    ['!',    {kind: "EV_FUNCTION", arity: 1, value: function (left: boolean) { return !left; }, about: "(! True)\tlogical negation"}],
    ['if',   {kind: "EV_FUNCTION", arity: 3, value: function (cond: boolean, left: boolean | number, right: boolean | number) { return cond ? left : right; }, about: "(if True 4 8)\tif-expression"}],
    ['help', {kind: "EV_FUNCTION", arity: 0, value: function () { return help(environment); }, about: "(help)\t\tprints this dialog"}],
    ['Help', {kind: "EV_FUNCTION", arity: 0, value: function () { return help(environment); }, about: "(Help)\t\tprints this dialog"}],
]);

function help(environment: Map<string, SymbolEntry>): string {
    let message: string = "\nSymbol\tUsage\t\tName\n------------------------------------------------\n";
    for (const [key, value] of environment.entries()) {
        if (value.arity !== undefined) {
            message += `${key}\t${value.about}\n`;
        }
    }
    message += "------------------------------------------------\n"
    message += "\nYou can write nested expressions, such as:\n\n(+ 1 (* 2 4))\n"
    return message;
}

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
            if(fn.arity == 0 && call.params.length == 0) {
                const f = fn.value as Function;
                return {kind: "EV_VALUE", value: f()} as EvaluationValue;
            }
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
            if(fn.arity == 3 && call.params.length == 3) {
                const zero = evaluate(call.params[0]);
                const one = evaluate(call.params[1]);
                const two = evaluate(call.params[2]);
                if (zero.kind === "EV_VALUE") {
                    if (one.kind === "EV_VALUE") {
                        if (two.kind === "EV_VALUE") {
                            const f = fn.value as Function;
                            const z = (zero as EvaluationValue).value;
                            const o = (one as EvaluationValue).value;
                            const t = (two as EvaluationValue).value;
                            return {kind: "EV_VALUE", value: f(z, o, t)} as EvaluationValue;
                        }
                        else {
                            return two;
                        }
                    }
                    else {
                        return one;
                    }
                }
                else {
                    return zero;
                }
            }
            else {
                return {kind: "EV_ERROR", message: `${call.params.length} argument(s) provided, expected ${fn.arity}`} as EvaluationError;
            }
        }
        else {
            const atom = call.func as ASTAtom;
            let m: string = `expected a function identifier, got '${atom.value}'`;
            if(typeof atom.value === "number") {
                m += ".\nMaybe you forgot a space between a '+' or '-' and a number";
            }
            return {kind: "EV_ERROR", message: m} as EvaluationError;
        }
    }
    return {kind: "EV_ERROR", message: `invalid expression`} as EvaluationError;
}
