// Copyright (c) 2025 Marco Nikander

import { Item } from "./item";
import { Token } from "./token";

export interface Error extends Item {
    kind: "Error",
    subkind: "Lexing" | "Parsing" | "Semantic" | "Evaluation",
    token_id: number,
    message: string,
}

export function error(subkind: "Lexing" | "Parsing" | "Semantic" | "Evaluation", message: string, token_number: number): Error {
    return { kind: "Error", subkind: subkind, token_id: token_number, message: message };
}

export function error_to_string(error: Error, tokens: Token[]): string {
    return `${error.subkind} error: ${error.message} '${tokens[error.token_id].value}'`;
}

export type Result<T> = { ok: true, value: T } | { ok: false, error: Error };

export function is_ok<T>(result: Result<T>): result is { ok: true, value: T } {
    return result.ok === true;
}

export function is_error<T>(result: Result<T>): result is { ok: false, error: Error } {
    return result.ok === false;
}
