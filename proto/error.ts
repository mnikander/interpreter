// Copyright (c) 2025 Marco Nikander

import { Item } from "./item";

export interface Error extends Item {
    kind: "Error",
    subkind: "Lexing" | "Parsing" | "Semantic" | "Evaluation",
    token_id: number,
    message: string,
}

export type Result<T> = { ok: true, value: T } | { ok: false, error: Error };

export function is_ok<T>(result: Result<T>): result is { ok: true, value: T } {
    return result.ok === true;
}

export function is_error<T>(result: Result<T>): result is { ok: false, error: Error } {
    return result.ok === false;
}
