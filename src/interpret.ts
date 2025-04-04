// Copyright (c) 2025 Marco Nikander

import { check_parentheses, add_whitespace_to_parentheses } from "./parentheses";
import { is_error, parse, Token } from "./parse";

export function interpret(line: string): string | number | undefined {
    const tokens    = parse(line);
    let first_error = tokens.find(is_error);
    if (first_error != undefined)
    {
        return `ERROR: invalid token '${first_error.symbol}'`;
    }
    // hardcode addition for now
    if (tokens[0].name == 'TK_NUMBER') {
        return tokens[0].value;
    }
    else if (tokens[0].name == 'TK_LEFT')  {
        if (tokens[1].name == 'TK_ADD') {
            if (tokens[2].name == 'TK_NUMBER' && tokens[3].name == 'TK_NUMBER' && tokens[4].name == 'TK_RIGHT') {
                if (tokens[2].value != undefined && tokens[3].value != undefined) {
                    return (tokens[2].value as number) + (tokens[3].value as number);
                }
            }
        }
        else {
            return "ERROR: no valid operation provided"
        }
    }
    else {
        return "ERROR: invalid expression";
    }
}
