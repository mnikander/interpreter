// Copyright (c) 2025 Marco Nikander

import { evaluate } from "./evaluator";
import { is_tk_error, tokenize, Token } from "./lexer";
import { Node, parse, ParseError, check_for_errors } from "./parser";

export function interpret(line: string): undefined | boolean | number | string {
    const tokens: Token[]                = tokenize(line);
    const lexer_error: Token | undefined = tokens.find(is_tk_error);
    if (lexer_error !== undefined)
    {
        let message = "ERROR: " + (lexer_error.value ?? "unknown");
        return message;
    }

    const [ast, index]: [Node, number] = parse(tokens);
    const parser_error: undefined | ParseError = check_for_errors(ast);
    if (parser_error !== undefined)
    {
        const message: string = "ERROR: " + ((parser_error as ParseError).value ?? "unknown");
        return message;
    }

    return evaluate(ast);
}
