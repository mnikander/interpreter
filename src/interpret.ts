// Copyright (c) 2025 Marco Nikander

import { evaluate } from "./evaluator";
import { tokenize, Token } from "./lexer";
import { ASTNode, parse } from "./parser";
import { Error, OK, is_error } from "./error";
import { analyze } from "./analyzer";
import { global_semantic_environment, global_evaluation_environment } from "./global_environments";

export function interpret(line: string): undefined | boolean | number | string {
    const lexingResult: Error | Token[] = tokenize(line);
    if (is_error(lexingResult)) {
        return (lexingResult as Error).kind + ": " + (lexingResult as Error).message + ". ";
    }
    else {
        const tokens = lexingResult as Token[];
        const parsingResult: Error | [ASTNode, number]  = parse(tokens);
        if (is_error(parsingResult)) {
            return (parsingResult as Error).kind +  ": " + (parsingResult as Error).message + ". ";
        }
        else {
            const [ast, index] = parsingResult as [ASTNode, number];
            const semanticResult: Error | OK = analyze(ast, global_semantic_environment);
            if (is_error(semanticResult)) {
                return (semanticResult as Error).kind + ": " + (semanticResult as Error).message + ". ";
            }
            else {
                const result = evaluate(ast, global_evaluation_environment);

                if(result.kind === "EV_VALUE") {
                    return result.value;
                }
                else if (result.kind === "EV_FUNCTION") {
                    return "Evaluation error: result is a function. ";
                }
                else if (is_error(result)) {
                    return `${(result as Error).kind}: ${(result as Error).message}. `;
                }
                else {
                    return "Evaluation error: unknown error. "
                }
            }
        }
    }
}
