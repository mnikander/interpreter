// Copyright (c) 2025 Marco Nikander

import { lex, Token } from "./lexer";
import { parse } from "./parser";
import { Environment, make_env, evaluate } from "./evaluator";
import { Flat_AST, Value } from "./flat_ast";
import { flatten } from "./flatten";
import { resolve_names } from "./name_resolution";

export function interpret(prompt: string) {
    const lexed: readonly Token[] = lex(prompt);
    const parsed = parse(lexed);
    const ast: Flat_AST = flatten(parsed.ast, parsed.node_count);
    const linked_ast: Flat_AST = resolve_names(ast);

    let env: Environment = make_env();
    const evaluated: Value = evaluate(linked_ast[0], linked_ast, env, []);

    return evaluated;
}
