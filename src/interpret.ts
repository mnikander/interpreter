// Copyright (c) 2025 Marco Nikander

import { evaluate, EvaluationError, EvaluationValue } from "./evaluator";
import { is_tk_error, tokenize, Token } from "./lexer";
import { ASTNode, parse, check_for_errors } from "./parser";

export function interpret(line: string): undefined | boolean | number | string {
    const tokens: Token[]                = tokenize(line);
    const lexer_error: Token | undefined = tokens.find(is_tk_error);
    if (lexer_error !== undefined)
    {
        let message = "ERROR: " + (lexer_error.value ?? "unknown");
        return message;
    }

    const [ast, index]: [ASTNode, number]  = parse(tokens);
    const parser_error: undefined | string = check_for_errors(ast);
    if (parser_error !== undefined)
    {
        const message: string = "ERROR: " + ((parser_error as ParseError).value ?? "unknown");
        return message;
    }

    const result = evaluate(ast);

    if(result.kind === "EV_VALUE") {
        return (result as EvaluationValue).value;
    }
    else if (result.kind === "EV_ENTRY") {
        return "ERROR: result is a function. ";
    }
    else if (result.kind === "EV_ERROR") {
        return `ERROR: ${(result as EvaluationError).message}. `;
    }
    else {
        return 'ERROR: unknown evaluation error. '
    }

}
