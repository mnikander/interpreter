// Copyright (c) 2025 Marco Nikander

import { evaluate } from "./evaluator";
import { tokenize, Token } from "./lexer";
import { ASTNode, parse } from "./parser";
import { Error, OK, is_error, error_to_string } from "./error";
import { analyze } from "./analyzer";
import { global_semantic_environment, global_evaluation_environment } from "./global_environments";

export function interpret(line: string): undefined | boolean | number | string {
    const lexingResult: Error | Token[] = tokenize(line);
    if (is_error(lexingResult)) {
        // print the error message manually, since we can't use 'error_to_string' (we don't have tokens)
        return lexingResult.kind + ": " + lexingResult.message + ". ";
    }
    else {
        const tokens = lexingResult;
        const parsingResult: Error | [ASTNode, number]  = parse(tokens);
        if (is_error(parsingResult)) {
            return error_to_string(parsingResult, tokens);
        }
        else {
            const [ast, index] = parsingResult;
            const semanticResult: Error | OK = analyze(ast, global_semantic_environment);
            if (is_error(semanticResult)) {
                return error_to_string(semanticResult, tokens);
            }
            else {
                const result = evaluate(ast, global_evaluation_environment);

                if(result.kind === "EVALUATOR_VALUE") {
                    return result.value;
                }
                else if (result.kind === "EVALUATOR_FUNCTION") {
                    return "Evaluation error: result is a function. ";
                }
                else if (is_error(result)) {
                    return error_to_string(result, tokens);
                }
                else {
                    return "Evaluation error: unknown error. "
                }
            }
        }
    }
}
