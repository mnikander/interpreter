// Copyright (c) 2025 Marco Nikander

import { ASTAtom } from "./parser";

export type Symbol =
    | { kind: "EV_FUNCTION", value: boolean | number | ((...args: any[]) => any), arity: number, about?: string, }
    | { kind: "EV_VALUE",    value: boolean | number };

export function lookup(identifier: ASTAtom, builtin: Map<string, Symbol>): undefined | Symbol {
    return builtin.get(String(identifier.value));
}

export const builtin: Map<string, Symbol> = new Map<string, Symbol>([
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
    ['help', {kind: "EV_FUNCTION", arity: 0, value: function ( args: any[] ) { return help(builtin); }, about: "(help)\t\tprints this dialog"}],
    ['Help', {kind: "EV_FUNCTION", arity: 0, value: function ( args: any[] ) { return help(builtin); }, about: "(Help)\t\tprints this dialog"}],
]);

function help(builtin: Map<string, Symbol>): string {
    let message: string = "\nSymbol\tUsage\t\tName\n------------------------------------------------\n";
    for (const [key, value] of builtin.entries()) {
        if ( value.kind === "EV_FUNCTION" && value.arity !== undefined) {
            message += `${key}\t${value?.about}\n`;
        }
    }
    message += "------------------------------------------------\n"
    message += "You can write nested expressions, such as:\n\n(+ 1 (* 2 4))\n"
    message += "------------------------------------------------\n"
    return message;
}
