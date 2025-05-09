// Copyright (c) 2025 Marco Nikander

import { lex } from "./lexer";
import { parse } from "./parser";
import { evaluate } from "./evaluator";
import { Result, is_ok, is_error, error_to_string } from "./error";
import { Token } from "./token";
import { AST } from "./ast";

export function interpret(prompt: string) {
    const lexed: Result<Token[]> = lex(prompt);
    if(is_error(lexed)) return error_to_string(lexed.error, []);

    const tokens: Token[] = lexed.value;
    const parsed: Result<AST> = parse(tokens);
    if(is_error(parsed)) return error_to_string(parsed.error, tokens);

    const ast = parsed.value;
    const evaluated: Result<boolean | number | string> = evaluate(ast, undefined);
    if(is_error(evaluated)) return error_to_string(evaluated.error, tokens);

    return evaluated.value;
}
