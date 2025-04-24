// Copyright (c) 2025 Marco Nikander

import { evaluate, EvaluationError, EvaluationValue } from "./evaluator";
import { tokenize, Token } from "./lexer";
import { ASTNode, parse } from "./parser";
import { Error, is_error } from "./error";

export function interpret(line: string): undefined | boolean | number | string {
    const lexingResult: Error | Token[] = tokenize(line);
    if (is_error(lexingResult)) {
        return "ERROR: " + ((lexingResult as Error).message) + ". ";
    }
    else {
        const tokens = lexingResult as Token[];
        const parsingResult: Error | [ASTNode, number]  = parse(tokens);
        if (is_error(parsingResult)) {
            return "ERROR: " + ((parsingResult as Error).message) + ". ";
        }
        else {
            const [ast, index] = parsingResult as [ASTNode, number];
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
                return "ERROR: unknown evaluation error. "
            }
        }
    }
}
