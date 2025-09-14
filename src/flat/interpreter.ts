// Copyright (c) 2025 Marco Nikander

import { lex } from "../lexer";
import { parse } from "./parser_oo";
import { Result, is_error, error_to_string } from "../error";
import { Token } from "../token";
import { Environment, make_env, evaluate } from "./lambda";
import { Flat_AST, Value } from "./flat_ast";
import { flatten } from "./flatten";
import { resolve_references } from "./reference_resolution";

export function interpret(prompt: string) {
    const lexed: Result<Token[]> = lex(prompt);
    if(is_error(lexed)) return error_to_string(lexed.error, []);

    const parsed = parse(lexed);
    const ast: Flat_AST = flatten(parsed.ast, parsed.node_count);

    const linked_ast: Flat_AST = resolve_references(ast);

    // TODO: check identifiers and resolve identifiers

    let env: Environment = make_env();
    const evaluated: Value = evaluate(linked_ast[0], linked_ast, env, []);

    return evaluated;
}
