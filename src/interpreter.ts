// Copyright (c) 2025 Marco Nikander

import { lex, Token } from "./lexer";
import { parse } from "../proto/anf_parser";
import { Environment, Value, evaluate, is_primitive_value, make_env } from "./evaluator";
import { Flat_AST } from "./flat_ast";
import { flatten } from "../proto/anf_flatten";
import { resolve_names } from "./resolver";
import { check_parentheses } from "./parentheses";
import { add_whitespace_to_parentheses, check_whitespace } from "./whitespace";

export function interpret(prompt: string): boolean | number | string {
    const ok_parentheses = check_parentheses(prompt);
    const lexed: readonly Token[] = lex(prompt);
    const ok_whitespace = check_whitespace(add_whitespace_to_parentheses(lexed));

    const parsed = parse(lexed);
    const unresolved_ast: Flat_AST = flatten(parsed.ast, parsed.node_count);
    const ast: Flat_AST = resolve_names(unresolved_ast);

    let env: Environment = make_env();
    const result: Value = evaluate(ast[0], ast, env);

    if (is_primitive_value(result)) {
        return result.value;
    }
    else {
        throw Error(`Expected final result to be a boolean, number, or string, got a '${result.tag}' instead`);
    }
}
