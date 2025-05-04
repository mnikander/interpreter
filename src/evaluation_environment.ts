// Copyright (c) 2025 Marco Nikander

import { ASTAtom } from "./parser";

export type EvaluationSymbol =
    | { kind: "EV_FUNCTION", value: boolean | number | ((...args: any[]) => any), about?: string, }
    | { kind: "EV_VALUE",    value: boolean | number };

export function evaluation_lookup(identifier: ASTAtom, environment: EvaluationEnvironment): undefined | EvaluationSymbol {
    const entry: undefined | EvaluationSymbol = environment.symbols.get(String(identifier.value));
    if (entry !== undefined) {
        return entry;
    }
    else {
        if (environment.parent !== undefined) {
            return evaluation_lookup(identifier, environment.parent);
        }
        else {
            // we are already in the global context (the root node), and have nowhere left to search for the symbol
            return undefined;
        }
    }
}

export type EvaluationEnvironment = {
    parent: undefined | EvaluationEnvironment,
    symbols: Map<string, EvaluationSymbol>,
};

export const global_evaluation_environment: EvaluationEnvironment = {
    parent: undefined,
    symbols: new Map<string, EvaluationSymbol>([
        ['+',    { kind: "EV_FUNCTION", value: function ( args: number[] )  { return args[0] + args[1]; },  about: "(+ 5 2)\t\taddition" }],
        ['-',    { kind: "EV_FUNCTION", value: function ( args: number[] )  { return args[0] - args[1]; },  about: "(- 5 2)\t\tsubtraction" }],
        ['*',    { kind: "EV_FUNCTION", value: function ( args: number[] )  { return args[0] * args[1]; },  about: "(* 5 2)\t\tmultiplication" }],
        ['/',    { kind: "EV_FUNCTION", value: function ( args: number[] )  { return args[0] / args[1]; },  about: "(/ 5 2)\t\tdivision" }],
        ['%',    { kind: "EV_FUNCTION", value: function ( args: number[] )  { return args[0] % args[1]; },  about: "(% 5 2)\t\tremainder after division" }],
        ['<',    { kind: "EV_FUNCTION", value: function ( args: number[] )  { return args[0] < args[1]; },  about: "(< 5 2)\t\tless than" }],
        ['>',    { kind: "EV_FUNCTION", value: function ( args: number[] )  { return args[0] > args[1]; },  about: "(> 5 2)\t\tgreater than" }],
        ['<=',   { kind: "EV_FUNCTION", value: function ( args: number[] )  { return args[0] <= args[1]; }, about: "(<= 5 2)\tless than or equal to" }],
        ['>=',   { kind: "EV_FUNCTION", value: function ( args: number[] )  { return args[0] >= args[1]; }, about: "(>= 5 2)\tgreater than or equal to" }],
        ['==',   { kind: "EV_FUNCTION", value: function ( args: any[] )     { return args[0] == args[1]; }, about: "(== 5 2)\tequal to" }],
        ['!=',   { kind: "EV_FUNCTION", value: function ( args: any[] )     { return args[0] != args[1]; }, about: "(!= 5 2)\tunequal to" }],
        ['&',    { kind: "EV_FUNCTION", value: function ( args: boolean[] ) { return args[0] && args[1]; }, about: "(& True False)\tlogical and" }],
        ['|',    { kind: "EV_FUNCTION", value: function ( args: boolean[] ) { return args[0] || args[1]; }, about: "(| True False)\tlogical or" }],
        ['!',    { kind: "EV_FUNCTION", value: function ( args: boolean[] ) { return !args[0]; },           about: "(! True)\tlogical negation" }],
        ['if',   { kind: "EV_FUNCTION", value: function ( args: any[] )     { return args[0] ? args[1] : args[2]; }, about: "(if True 4 8)\tif-expression" }],
        ['help', { kind: "EV_FUNCTION", value: function ( args: any[] )     { return help(); },             about: "(help)\t\tprints this dialog" }],
        ['Help', { kind: "EV_FUNCTION", value: function ( args: any[] )     { return help(); },             about: "(Help)\t\tprints this dialog" }],
])};

function help(): string {
    let message: string = "\nSymbol\tUsage\t\tName\n------------------------------------------------\n";
    for (const [key, value] of global_evaluation_environment.symbols.entries()) {
        if ( value.kind === "EV_FUNCTION") {
            message += `${key}\t${value?.about}\n`;
        }
    }
    message += "------------------------------------------------\n"
    message += "You can write nested expressions, such as:\n\n(+ 1 (* 2 4))\n"
    message += "------------------------------------------------\n"
    return message;
}
