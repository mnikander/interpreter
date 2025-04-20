// Copyright (c) 2025 Marco Nikander

import { check_parentheses, add_whitespace_to_parentheses } from "./parentheses";
import { is_tk_error, tokenize, Token } from "./lexer";
import { check_for_errors, is_nd_atom, is_nd_call, is_nd_identifier, Node, NodeAtom, NodeCall, NodeIdentifier, parse, ParseError } from "./parser";

export function interpret(line: string): string | number | undefined {
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

    // hardcode the use of a single constant OR addition
    if (is_nd_atom(ast)) {
        return (ast as NodeAtom).value;
    }
    else if (is_nd_call(ast)) {
        const call = ast as NodeCall;
        if (is_nd_identifier(call.func)) {
            const func = call.func as NodeIdentifier;
            if (func.value === "+") {
                if(call.params.length == 2) {
                    if(is_nd_atom(call.params[0]) && is_nd_atom(call.params[1])) {
                        const left = call.params[0] as NodeAtom;
                        const right = call.params[1] as NodeAtom;
                        if (typeof left.value === "number" && typeof right.value === "number") {
                            return left.value + right.value;
                        }
                        else {
                            return "ERROR: invalid arguments, expected numbers";
                        }
                    }
                    else {
                        return "ERROR: invalid arguments, expected atoms"
                    }
                }
                else {
                    return "ERROR: invalid number of arguments, expected 2";
                }
            }
            else {
                return "ERROR: unknown function";
            }
        }
        else {
            return "ERROR: expected function identifier";
        }
    }
    else {
        return "ERROR: invalid expression";
    }
}
