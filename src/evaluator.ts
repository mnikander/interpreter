// Copyright (c) 2025 Marco Nikander

import { is_nd_boolean, is_nd_number, is_nd_identifier, is_nd_call, ASTNode, ASTAtom} from "./parser";
import { Error, is_error } from "./error";

export interface Entry {
    kind: "EV_FUNCTION",
    value: boolean | number | ((...args: any[]) => any),
    arity?: number,
    about?: string,
};

export interface Value {
    kind: "EV_VALUE",
    value: boolean | number | ((...args: any[]) => any),
}

const environment: Map<string, Entry> = new Map<string, Entry>([
    ['+',    {kind: "EV_FUNCTION", arity: 2, value: function ( ...args: number[] ) { return args[0] + args[1]; }, about: "(+ 5 2)\t\taddition"}],
    ['-',    {kind: "EV_FUNCTION", arity: 2, value: function ( ...args: number[] ) { return args[0] - args[1]; }, about: "(- 5 2)\t\tsubtraction"}],
    ['*',    {kind: "EV_FUNCTION", arity: 2, value: function ( ...args: number[] ) { return args[0] * args[1]; }, about: "(* 5 2)\t\tmultiplication"}],
    ['/',    {kind: "EV_FUNCTION", arity: 2, value: function ( ...args: number[] ) { return args[0] / args[1]; }, about: "(/ 5 2)\t\tdivision"}],
    ['%',    {kind: "EV_FUNCTION", arity: 2, value: function ( ...args: number[] ) { return args[0] % args[1]; }, about: "(% 5 2)\t\tremainder after division"}],
    ['<',    {kind: "EV_FUNCTION", arity: 2, value: function ( ...args: number[] ) { return args[0] < args[1]; }, about: "(< 5 2)\t\tless than"}],
    ['>',    {kind: "EV_FUNCTION", arity: 2, value: function ( ...args: number[] ) { return args[0] > args[1]; }, about: "(> 5 2)\t\tgreater than"}],
    ['<=',   {kind: "EV_FUNCTION", arity: 2, value: function ( ...args: number[] ) { return args[0] <= args[1]; }, about: "(<= 5 2)\tless than or equal to"}],
    ['>=',   {kind: "EV_FUNCTION", arity: 2, value: function ( ...args: number[] ) { return args[0] >= args[1]; }, about: "(>= 5 2)\tgreater than or equal to"}],
    ['==',   {kind: "EV_FUNCTION", arity: 2, value: function ( ...args: any[] ) { return args[0] == args[1]; }, about: "(== 5 2)\tequal to"}],
    ['!=',   {kind: "EV_FUNCTION", arity: 2, value: function ( ...args: any[] ) { return args[0] != args[1]; }, about: "(!= 5 2)\tunequal to"}],
    ['&',    {kind: "EV_FUNCTION", arity: 2, value: function ( ...args: boolean[] ) { return args[0] && args[1]; }, about: "(& True False)\tlogical and"}],
    ['|',    {kind: "EV_FUNCTION", arity: 2, value: function ( ...args: boolean[] ) { return args[0] || args[1]; }, about: "(| True False)\tlogical or"}],
    ['!',    {kind: "EV_FUNCTION", arity: 1, value: function ( ...args: boolean[] ) { return !args[0]; }, about: "(! True)\tlogical negation"}],
    ['if',   {kind: "EV_FUNCTION", arity: 3, value: function ( ...args: any[] ) { return args[0] ? args[1] : args[2]; }, about: "(if True 4 8)\tif-expression"}],
    ['help', {kind: "EV_FUNCTION", arity: 0, value: function ( ...args: any[] ) { return help(environment); }, about: "(help)\t\tprints this dialog"}],
    ['Help', {kind: "EV_FUNCTION", arity: 0, value: function ( ...args: any[] ) { return help(environment); }, about: "(Help)\t\tprints this dialog"}],
]);

function help(environment: Map<string, Entry>): string {
    let message: string = "\nSymbol\tUsage\t\tName\n------------------------------------------------\n";
    for (const [key, value] of environment.entries()) {
        if (value.arity !== undefined) {
            message += `${key}\t${value.about}\n`;
        }
    }
    message += "------------------------------------------------\n"
    message += "You can write nested expressions, such as:\n\n(+ 1 (* 2 4))\n"
    message += "------------------------------------------------\n"
    return message;
}

export function lookup(identifier: ASTAtom, environment: Map<string, Entry>): undefined | Entry {
    return environment.get(String(identifier.value));
}

export function evaluate(ast: ASTNode): Error | Entry | Value {
    // hardcode the use of a single constant OR addition
    if (is_nd_boolean(ast)) {
        let v = (ast as {kind: "ND_BOOLEAN", value: boolean}).value;
        return {kind: 'EV_VALUE', value: v} as Value;
    }
    else if (is_nd_number(ast)) {
        let v = (ast as {kind: "ND_NUMBER", value: number}).value;
        return {kind: 'EV_VALUE', value: v} as Value;
    }
    else if (is_nd_identifier(ast)) {
        const identifier = ast as { kind: "ND_IDENTIFIER", value: string};
        const target: undefined | Entry = lookup(identifier, environment);
        if (target !== undefined) {
            return target;
        } else {
            return {kind: "Evaluation Error", message: `unknown identifier '${identifier.value}'`};
        }
    }
    else if (is_nd_call(ast)) {
        const call: ASTNode = ast as { kind: "ND_CALL", func: ASTNode, params: ASTNode[]};
        const identifier: ASTNode = call.func as { kind: "ND_IDENTIFIER", value: string };
        const fn: undefined | Entry = lookup(identifier, environment);
        if(fn?.kind === "EV_FUNCTION") {
            if(fn.arity === call.params.length) {
                if(fn.arity == 0) {
                    const f = fn.value as Function;
                    return {kind: "EV_VALUE", value: f()} as Value;
                }
                if(fn.arity == 1) {
                    const left = evaluate(call.params[0]);
                    if (left.kind === "EV_VALUE") {
                        const f = fn.value as Function;
                        const l = (left as Value).value;
                        return {kind: "EV_VALUE", value: f(l)} as Value;
                    }
                    else {
                        return left;
                    }
                }
                if(fn.arity == 2) {
                    const left  = evaluate(call.params[0]);
                    const right = evaluate(call.params[1]);
                    if (left.kind === "EV_VALUE") {
                        if (right.kind === "EV_VALUE") {
                        const f = fn.value as Function;
                        const l = (left as Value).value;
                        const r = (right as Value).value;
                        return {kind: "EV_VALUE", value: f(l, r)} as Value;
                        }
                        else {
                            return right;
                        }
                    }
                    else {
                        return left;
                    }
                }
                if(fn.arity == 3) {
                    const zero = evaluate(call.params[0]);
                    const one  = evaluate(call.params[1]);
                    const two  = evaluate(call.params[2]);
                    if (zero.kind === "EV_VALUE") {
                        if (one.kind === "EV_VALUE") {
                            if (two.kind === "EV_VALUE") {
                                const f = fn.value as Function;
                                const z = (zero as Value).value;
                                const o = (one as Value).value;
                                const t = (two as Value).value;
                                return {kind: "EV_VALUE", value: f(z, o, t)} as Value;
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
                    return {kind: "Evaluation Error", message: `Only functions with 0, 1, 2, or 3 arguments can be evaluated, but ${call.params.length} argument(s) were provided`};
                }
            }
            else {
                return {kind: "Evaluation Error", message: `${call.params.length} argument(s) provided, expected ${fn.arity}`};
            }
        }
        else {
            const atom = call.func as ASTAtom;
            let m: string = `expected a function identifier, got '${atom.value}'`;
            if(typeof atom.value === "number") {
                m += ".\nMaybe you forgot a space between a '+' or '-' and a number";
            }
            return {kind: "Evaluation Error", message: m};
        }
    }
    return {kind: "Evaluation Error", message: `invalid expression`};
}
