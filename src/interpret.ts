// Copyright (c) 2025 Marco Nikander

import { check_parentheses, add_whitespace_to_parentheses } from "./parentheses";
import { is_tk_error, is_tk_number, is_tk_left, is_tk_right, is_tk_add, tokenize, Token } from "./lexer";

export function interpret(line: string): string | number | undefined {
    const tokens    = tokenize(line);
    let first_error = tokens.find(is_tk_error);
    if (first_error != undefined)
    {
        let message = "ERROR: " + (first_error.value ?? "unknown");
        return message;
    }

    // hardcode addition for now
    if (tokens.length == 1 && is_tk_number(tokens[0])) {
        return tokens[0].value;
    }
    else if (is_tk_left(tokens[0]))  {
        if (is_tk_add(tokens[1])) {
            if (is_tk_number(tokens[2]) && is_tk_number(tokens[3]) && is_tk_right(tokens[4])) {
                return (tokens[2].value as number) + (tokens[3].value as number);
            }
        }
        else {
            return "ERROR: no valid operation provided"
        }
    }
    else {
        return "ERROR: invalid expression";
    }
    return "ERROR: unknown";
}
