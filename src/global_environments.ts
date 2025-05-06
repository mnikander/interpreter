// Copyright (c) 2025 Marco Nikander

import { SemanticEnvironment, SemanticSymbol } from "./semantic_environment";
import { EvaluationEnvironment, EvaluationSymbol } from "./evaluator_environment";

export const global_semantic_environment: SemanticEnvironment = {
    parent: undefined,
    symbols: new Map<string, SemanticSymbol>([
        ['+',    { kind: "SEMANTIC_FUNCTION", arity: 2 }],
        ['-',    { kind: "SEMANTIC_FUNCTION", arity: 2 }],
        ['*',    { kind: "SEMANTIC_FUNCTION", arity: 2 }],
        ['/',    { kind: "SEMANTIC_FUNCTION", arity: 2 }],
        ['%',    { kind: "SEMANTIC_FUNCTION", arity: 2 }],
        ['<',    { kind: "SEMANTIC_FUNCTION", arity: 2 }],
        ['>',    { kind: "SEMANTIC_FUNCTION", arity: 2 }],
        ['<=',   { kind: "SEMANTIC_FUNCTION", arity: 2 }],
        ['>=',   { kind: "SEMANTIC_FUNCTION", arity: 2 }],
        ['==',   { kind: "SEMANTIC_FUNCTION", arity: 2 }],
        ['!=',   { kind: "SEMANTIC_FUNCTION", arity: 2 }],
        ['&',    { kind: "SEMANTIC_FUNCTION", arity: 2 }],
        ['|',    { kind: "SEMANTIC_FUNCTION", arity: 2 }],
        ['!',    { kind: "SEMANTIC_FUNCTION", arity: 1 }],
        ['if',   { kind: "SEMANTIC_FUNCTION", arity: 3 }],
        ['help', { kind: "SEMANTIC_FUNCTION", arity: 0 }],
        ['Help', { kind: "SEMANTIC_FUNCTION", arity: 0 }],
])}; 

export const global_evaluation_environment: EvaluationEnvironment = {
    parent: undefined,
    symbols: new Map<string, EvaluationSymbol>([
        ['+',    { kind: "EVALUATOR_FUNCTION", value: function ( args: number[] )  { return args[0] + args[1]; },  about: "(+ 5 2)\t\taddition" }],
        ['-',    { kind: "EVALUATOR_FUNCTION", value: function ( args: number[] )  { return args[0] - args[1]; },  about: "(- 5 2)\t\tsubtraction" }],
        ['*',    { kind: "EVALUATOR_FUNCTION", value: function ( args: number[] )  { return args[0] * args[1]; },  about: "(* 5 2)\t\tmultiplication" }],
        ['/',    { kind: "EVALUATOR_FUNCTION", value: function ( args: number[] )  { return args[0] / args[1]; },  about: "(/ 5 2)\t\tdivision" }],
        ['%',    { kind: "EVALUATOR_FUNCTION", value: function ( args: number[] )  { return args[0] % args[1]; },  about: "(% 5 2)\t\tremainder after division" }],
        ['<',    { kind: "EVALUATOR_FUNCTION", value: function ( args: number[] )  { return args[0] < args[1]; },  about: "(< 5 2)\t\tless than" }],
        ['>',    { kind: "EVALUATOR_FUNCTION", value: function ( args: number[] )  { return args[0] > args[1]; },  about: "(> 5 2)\t\tgreater than" }],
        ['<=',   { kind: "EVALUATOR_FUNCTION", value: function ( args: number[] )  { return args[0] <= args[1]; }, about: "(<= 5 2)\tless than or equal to" }],
        ['>=',   { kind: "EVALUATOR_FUNCTION", value: function ( args: number[] )  { return args[0] >= args[1]; }, about: "(>= 5 2)\tgreater than or equal to" }],
        ['==',   { kind: "EVALUATOR_FUNCTION", value: function ( args: any[] )     { return args[0] == args[1]; }, about: "(== 5 2)\tequal to" }],
        ['!=',   { kind: "EVALUATOR_FUNCTION", value: function ( args: any[] )     { return args[0] != args[1]; }, about: "(!= 5 2)\tunequal to" }],
        ['&',    { kind: "EVALUATOR_FUNCTION", value: function ( args: boolean[] ) { return args[0] && args[1]; }, about: "(& True False)\tlogical and" }],
        ['|',    { kind: "EVALUATOR_FUNCTION", value: function ( args: boolean[] ) { return args[0] || args[1]; }, about: "(| True False)\tlogical or" }],
        ['!',    { kind: "EVALUATOR_FUNCTION", value: function ( args: boolean[] ) { return !args[0]; },           about: "(! True)\tlogical negation" }],
        ['if',   { kind: "EVALUATOR_FUNCTION", value: function ( args: any[] )     { return args[0] ? args[1] : args[2]; }, about: "(if True 4 8)\tif-expression" }],
        ['help', { kind: "EVALUATOR_FUNCTION", value: function ( args: any[] )     { return help(); },             about: "(help)\t\tprints this dialog" }],
        ['Help', { kind: "EVALUATOR_FUNCTION", value: function ( args: any[] )     { return help(); },             about: "(Help)\t\tprints this dialog" }],
])};

function help(): string {
    let message: string = "\nSymbol\tUsage\t\tName\n------------------------------------------------\n";
    for (const [key, value] of global_evaluation_environment.symbols.entries()) {
        if ( value.kind === "EVALUATOR_FUNCTION") {
            message += `${key}\t${value?.about}\n`;
        }
    }
    message += "------------------------------------------------\n"
    message += "You can write nested expressions, such as:\n\n(+ 1 (* 2 4))\n"
    message += "------------------------------------------------\n"
    return message;
}
