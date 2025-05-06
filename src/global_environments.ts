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
        ['+',    { kind: "EVALUATOR_FUNCTION", value: function ( args: number[] )  { return args[0] + args[1]; }, }],
        ['-',    { kind: "EVALUATOR_FUNCTION", value: function ( args: number[] )  { return args[0] - args[1]; }, }],
        ['*',    { kind: "EVALUATOR_FUNCTION", value: function ( args: number[] )  { return args[0] * args[1]; }, }],
        ['/',    { kind: "EVALUATOR_FUNCTION", value: function ( args: number[] )  { return args[0] / args[1]; }, }],
        ['%',    { kind: "EVALUATOR_FUNCTION", value: function ( args: number[] )  { return args[0] % args[1]; }, }],
        ['<',    { kind: "EVALUATOR_FUNCTION", value: function ( args: number[] )  { return args[0] < args[1]; }, }],
        ['>',    { kind: "EVALUATOR_FUNCTION", value: function ( args: number[] )  { return args[0] > args[1]; }, }],
        ['<=',   { kind: "EVALUATOR_FUNCTION", value: function ( args: number[] )  { return args[0] <= args[1]; },}],
        ['>=',   { kind: "EVALUATOR_FUNCTION", value: function ( args: number[] )  { return args[0] >= args[1]; },}],
        ['==',   { kind: "EVALUATOR_FUNCTION", value: function ( args: any[] )     { return args[0] == args[1]; },}],
        ['!=',   { kind: "EVALUATOR_FUNCTION", value: function ( args: any[] )     { return args[0] != args[1]; },}],
        ['&',    { kind: "EVALUATOR_FUNCTION", value: function ( args: boolean[] ) { return args[0] && args[1]; },}],
        ['|',    { kind: "EVALUATOR_FUNCTION", value: function ( args: boolean[] ) { return args[0] || args[1]; },}],
        ['!',    { kind: "EVALUATOR_FUNCTION", value: function ( args: boolean[] ) { return !args[0]; },          }],
        ['if',   { kind: "EVALUATOR_FUNCTION", value: function ( args: any[] )     { return args[0] ? args[1] : args[2]; },}],
        ['help', { kind: "EVALUATOR_FUNCTION", value: function ( args: any[] )     { return help(); }, }],
        ['Help', { kind: "EVALUATOR_FUNCTION", value: function ( args: any[] )     { return help(); }, }],
])};

type Description = { op: string, example: string, about: string };
const help_text: Description[] = [
    {op: 'help', example: "(help)",            about: "\t\tprints this dialog" },
    {op: 'Help', example: "(Help)",            about: "\t\tprints this dialog" },
    {op: '+',    example: "(+ 5 2)",           about: "\t\taddition" },
    {op: '-',    example: "(- 5 2)",           about: "\t\tsubtraction" },
    {op: '*',    example: "(* 5 2)",           about: "\t\tmultiplication" },
    {op: '/',    example: "(/ 5 2)",           about: "\t\tdivision" },
    {op: '%',    example: "(% 5 2)",           about: "\t\tremainder after division" },
    {op: '<',    example: "(< 5 2)",           about: "\t\tless than" },
    {op: '>',    example: "(> 5 2)",           about: "\t\tgreater than" },
    {op: '<=',   example: "(<= 5 2)",          about: "\tless than or equal to" },
    {op: '>=',   example: "(>= 5 2)",          about: "\tgreater than or equal to" },
    {op: '==',   example: "(== 5 2)",          about: "\tequal to" },
    {op: '!=',   example: "(!= 5 2)",          about: "\tunequal to" },
    {op: '&',    example: "(& True False)",    about: "\tlogical and" },
    {op: '|',    example: "(| True False)",    about: "\tlogical or" },
    {op: '!',    example: "(! True)",          about: "\tlogical negation" },
    {op: 'if',   example: "(if True 4 8)",     about: "\tif-expression" },
    {op: 'let',  example: "(let x 5 (* 2 x))", about: "variables in expressions"},
];

function help(): string {
    const line: string = "--------------------------------------------------------\n";
    let message: string = "\nSymbol\tUsage\t\t\tName\n" + line;
    for (const description of help_text) {
        message += `${description.op}\t${description.example}\t${description.about}\n`;
    }
    message += line;
    message += "You can write nested expressions, such as:\n\n(+ 1 (* 2 4))\n"
    message += line;
    return message;
}
