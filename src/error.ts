// Copyright (c) 2025 Marco Nikander

export type Error = 
    | { kind: "Lexing error", message: string, column?: number }
    | { kind: "Parsing error", message: string, column?: number }
    | { kind: "Semantic error", message: string, column?: number }
    | { kind: "Evaluation error", message: string, column?: number };

export function is_error(item: any) {
    return 'kind' in item && (
           item.kind === "Lexing error" ||
           item.kind === "Parsing error" ||
           item.kind === "Semantic error" ||
           item.kind === "Evaluation error");
}

export type OK = { kind: "OK" };
