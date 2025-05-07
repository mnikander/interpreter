// Copyright (c) 2025 Marco Nikander

import { Item } from "./item";

export interface Ok extends Item {
    kind: "Ok",
    subkind: "Ok",
}

export interface Error extends Item {
    kind: "Error",
    subkind: "Lexing" | "Parsing" | "Semantic" | "Evaluation",
    token_id: number,
    message: string,
}

export function is_ok(item: Item): item is Ok {
    return item.kind === "Ok";
}

export function is_error(item: Item | Item[]): item is Error {
    if (Array.isArray(item)) {
        const first_error = item.find(is_error);
        return first_error !== undefined;
    }
    else {
        return item.kind === "Error";
    }
}
