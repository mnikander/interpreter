// Copyright (c) 2025 Marco Nikander

import { lex } from "./lexer";
import { parse } from "./parser";
import { Value, evaluate, value_env } from "./evaluator";
import { Result, is_error, error_to_string } from "./error";
import { Token } from "./token";
import { RawAST } from "./ast";

export function interpret(prompt: string) {
    const lexed: Result<Token[]> = lex(prompt);
    if(is_error(lexed)) return error_to_string(lexed.error, []);

    const tokens: Token[] = lexed.value;
    const parsed: Result<RawAST> = parse(tokens);
    if(is_error(parsed)) return error_to_string(parsed.error, tokens);

    const ast = parsed.value;
    const evaluated: Result<Value> = evaluate(ast, value_env);
    if(is_error(evaluated)) return error_to_string(evaluated.error, tokens);

    return evaluated.value;
}
