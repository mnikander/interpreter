// Copyright (c) 2025 Marco Nikander

import { Token } from "./lexer";

export type ErrorKind = "Lexing error" | "Parsing error" | "Semantic error" | "Evaluation error";

export type Error = {
    kind: ErrorKind,
    message: string,
    token_id: number,
};

export function is_error(item: any): item is Error {
    return 'kind' in item && (
           item.kind === "Lexing error" ||
           item.kind === "Parsing error" ||
           item.kind === "Semantic error" ||
           item.kind === "Evaluation error");
}

export type OK = { kind: "OK" };

export function error_to_string(error: Error, tokens: Token[]): string {
    return `${error.kind} at '${tokens[error.token_id].value}': ${error.message}.`;
}

export function number_of_arguments_error(kind: ErrorKind, provided: number | string, expected: number, token_id: number): Error {
    return { kind: kind, token_id: token_id, message: `expected ${expected} arguments, ${provided} provided`};
}
