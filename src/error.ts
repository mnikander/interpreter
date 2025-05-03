// Copyright (c) 2025 Marco Nikander

export type Error = 
    | { kind: "Lexing Error", message: string, column?: number }
    | { kind: "Parsing Error", message: string, column?: number }
    | { kind: "Semantic Error", message: string, column?: number }
    | { kind: "Evaluation Error", message: string, column?: number };

export function is_error(item: any) {
    return 'kind' in item && (
           item.kind === "Lexing Error" || 
           item.kind === "Parsing Error" ||
           item.kind === "Semantic Error" ||
           item.kind === "Evaluation Error");
}

export type OK = { kind: "OK" };
