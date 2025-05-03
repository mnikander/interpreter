// Copyright (c) 2025 Marco Nikander

import { is_nd_boolean, is_nd_number, is_nd_identifier, is_nd_call, ASTNode, ASTAtom} from "./parser";
import { Error, is_error } from "./error";

export type Symbol =
    | { kind: "EV_FUNCTION", value: boolean | number | ((...args: any[]) => any), arity: number, about?: string, }
    | { kind: "EV_VALUE",    value: boolean | number };

const environment: Map<string, Symbol> = new Map<string, Symbol>([
    ['+',    {kind: "EV_FUNCTION", arity: 2, value: function ( args: number[] ) { return args[0] + args[1]; }, about: "(+ 5 2)\t\taddition"}],
    ['-',    {kind: "EV_FUNCTION", arity: 2, value: function ( args: number[] ) { return args[0] - args[1]; }, about: "(- 5 2)\t\tsubtraction"}],
    ['*',    {kind: "EV_FUNCTION", arity: 2, value: function ( args: number[] ) { return args[0] * args[1]; }, about: "(* 5 2)\t\tmultiplication"}],
    ['/',    {kind: "EV_FUNCTION", arity: 2, value: function ( args: number[] ) { return args[0] / args[1]; }, about: "(/ 5 2)\t\tdivision"}],
    ['%',    {kind: "EV_FUNCTION", arity: 2, value: function ( args: number[] ) { return args[0] % args[1]; }, about: "(% 5 2)\t\tremainder after division"}],
    ['<',    {kind: "EV_FUNCTION", arity: 2, value: function ( args: number[] ) { return args[0] < args[1]; }, about: "(< 5 2)\t\tless than"}],
    ['>',    {kind: "EV_FUNCTION", arity: 2, value: function ( args: number[] ) { return args[0] > args[1]; }, about: "(> 5 2)\t\tgreater than"}],
    ['<=',   {kind: "EV_FUNCTION", arity: 2, value: function ( args: number[] ) { return args[0] <= args[1]; }, about: "(<= 5 2)\tless than or equal to"}],
    ['>=',   {kind: "EV_FUNCTION", arity: 2, value: function ( args: number[] ) { return args[0] >= args[1]; }, about: "(>= 5 2)\tgreater than or equal to"}],
    ['==',   {kind: "EV_FUNCTION", arity: 2, value: function ( args: any[] ) { return args[0] == args[1]; }, about: "(== 5 2)\tequal to"}],
    ['!=',   {kind: "EV_FUNCTION", arity: 2, value: function ( args: any[] ) { return args[0] != args[1]; }, about: "(!= 5 2)\tunequal to"}],
    ['&',    {kind: "EV_FUNCTION", arity: 2, value: function ( args: boolean[] ) { return args[0] && args[1]; }, about: "(& True False)\tlogical and"}],
    ['|',    {kind: "EV_FUNCTION", arity: 2, value: function ( args: boolean[] ) { return args[0] || args[1]; }, about: "(| True False)\tlogical or"}],
    ['!',    {kind: "EV_FUNCTION", arity: 1, value: function ( args: boolean[] ) { return !args[0]; }, about: "(! True)\tlogical negation"}],
    ['if',   {kind: "EV_FUNCTION", arity: 3, value: function ( args: any[] ) { return args[0] ? args[1] : args[2]; }, about: "(if True 4 8)\tif-expression"}],
    ['help', {kind: "EV_FUNCTION", arity: 0, value: function ( args: any[] ) { return help(environment); }, about: "(help)\t\tprints this dialog"}],
    ['Help', {kind: "EV_FUNCTION", arity: 0, value: function ( args: any[] ) { return help(environment); }, about: "(Help)\t\tprints this dialog"}],
]);

function help(environment: Map<string, Symbol>): string {
    let message: string = "\nSymbol\tUsage\t\tName\n------------------------------------------------\n";
    for (const [key, value] of environment.entries()) {
        if ( value.kind === "EV_FUNCTION" && value.arity !== undefined) {
            message += `${key}\t${value?.about}\n`;
        }
    }
    message += "------------------------------------------------\n"
    message += "You can write nested expressions, such as:\n\n(+ 1 (* 2 4))\n"
    message += "------------------------------------------------\n"
    return message;
}

export function lookup(identifier: ASTAtom, environment: Map<string, Symbol>): undefined | Symbol {
    return environment.get(String(identifier.value));
}

export function evaluate(ast: ASTNode): Error | Symbol {
    // hardcode the use of a single constant OR addition
    if (is_nd_boolean(ast)) {
        let v = (ast as {kind: "ND_BOOLEAN", value: boolean}).value;
        return {kind: 'EV_VALUE', value: v};
    }
    else if (is_nd_number(ast)) {
        let v = (ast as {kind: "ND_NUMBER", value: number}).value;
        return {kind: 'EV_VALUE', value: v};
    }
    else if (is_nd_identifier(ast)) {
        const identifier = ast as { kind: "ND_IDENTIFIER", value: string};
        const entry: undefined | Symbol = lookup(identifier, environment);
        if (entry !== undefined) {
            return entry;
        } else {
            return {kind: "Evaluation Error", message: `unknown identifier '${identifier.value}'`};
        }
    }
    else if (is_nd_call(ast)) {
        const call: ASTNode         = ast as { kind: "ND_CALL", func: ASTNode, params: ASTNode[]};
        const id: ASTNode           = call.func as { kind: "ND_IDENTIFIER", value: string };
        const entry: Error | Symbol = evaluate(id);
        if(entry.kind === "EV_FUNCTION") {
            if(entry.arity === call.params.length) {
                const ev_args: (Error | Symbol)[] = call.params.map(evaluate);
                const err: undefined | Error      = ev_args.find(is_error) as (undefined | Error);
                if(err === undefined) {
                    const fn   = entry.value as Function;
                    const args = (ev_args as Symbol[]).map((s: Symbol) => { return s.value; });
                    return {kind: "EV_VALUE", value: fn(args)};
                }
                else {
                    return err;
                }
            }
            else {
                return {kind: "Evaluation Error", message: `${call.params.length} argument(s) provided, expected ${entry.arity}`};
            }
        }
        else if (is_error(entry)) {
            return entry;
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
