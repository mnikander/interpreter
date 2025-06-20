// Copyright (c) 2025 Marco Nikander

import { lex } from "./lexer";
import { parse } from "./parser";
import { Value, evaluate, builtin_functions } from "./evaluator";
import { Result, is_error, error_to_string } from "./error";
import { Token } from "./token";
import { AST, NodeIdToTokenId } from "./ast";
import { check_identifiers, Identifiers } from "./check_identifiers";
import { Environment } from "./evaluator";

export function interpret(prompt: string) {
    const lexed: Result<Token[]> = lex(prompt);
    if(is_error(lexed)) return error_to_string(lexed.error, [], undefined);

    const tokens: Token[] = lexed.value;
    const parsed: { ast: Result<AST>, token_lookup_table: NodeIdToTokenId } = parse(tokens);
    if(is_error(parsed.ast)) return error_to_string(parsed.ast.error, tokens, parsed.token_lookup_table);

    const check: Result<undefined> = check_identifiers(parsed.ast.value, create_set_of_names(builtin_functions));
    if(is_error(check)) return error_to_string(check.error, tokens, parsed.token_lookup_table);

    const ast = parsed.ast.value;
    const evaluated: Result<Value> = evaluate(ast, builtin_functions);
    if(is_error(evaluated)) return error_to_string(evaluated.error, tokens, parsed.token_lookup_table);

    return evaluated.value;
}

function create_set_of_names(builtin_environment: Environment): Identifiers {
    return { parent: undefined, symbols: new Set(Array.from(builtin_environment.symbols.keys())) };
}
