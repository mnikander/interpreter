// Copyright (c) 2025 Marco Nikander

import { Item } from "./item";
import { Token } from "./token";
import { NodeIdToTokenId } from "./ast";

export interface Error extends Item {
    kind: "Error",
    subkind: "Lexing" | "Parsing" | "Semantic" | "Evaluation",
    token_or_node_id: number,
    message: string,
}

export function error(subkind: "Lexing" | "Parsing" | "Semantic" | "Evaluation", message: string, token_number: number): Error {
    return { kind: "Error", subkind: subkind, token_or_node_id: token_number, message: message };
}

export function error_to_string(error: Error, tokens: Token[], node_to_token_dictionary: undefined | NodeIdToTokenId): string {
    if (error.subkind === 'Lexing') {
        return `${error.subkind} error: ${error.message} '${tokens[error.token_or_node_id].value}'`;
    }
    else {
        // since the AST does not store the token ids directly, we must use a dictionary to map from the AST node id to
        // the token id, so we can output a meaningful error message
        const token_id: undefined | number = node_to_token_dictionary?.get(error.token_or_node_id);
        if (token_id !== undefined) {
            return `${error.subkind} error: ${error.message} '${tokens[token_id].value}'`;
        }
        else {
            return `Programming error: there is a bug in the parsing, semantic, or evaluation phase. A node id is being referenced, for which there is no corresponding token id.`;
        }
    }
}

export type Result<T> = { ok: true, value: T } | { ok: false, error: Error };

export function is_ok<T>(result: Result<T>): result is { ok: true, value: T } {
    return result.ok === true;
}

export function is_error<T>(result: Result<T>): result is { ok: false, error: Error } {
    return result.ok === false;
}
