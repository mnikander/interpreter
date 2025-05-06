// Copyright (c) 2025 Marco Nikander

import { Token } from "./lexer";

export type Error = 
    | { kind: "Lexing error", message: string, token_id: number }
    | { kind: "Parsing error", message: string, token_id: number }
    | { kind: "Semantic error", message: string, token_id: number }
    | { kind: "Evaluation error", message: string, token_id: number };

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
