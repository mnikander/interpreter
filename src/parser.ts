// Copyright (c) 2025 Marco Nikander

export interface Node {
    kind: string,
}

export interface NodeAtom extends Node {
    kind: "ND_ATOM",
    value: number | string, // TODO: add Booleans
}

export interface NodeCall extends Node {
    kind: "ND_CALL",
    procedure: Node,
    parameters: Node[],
}

export interface NodeExpression extends Node {
    kind: "ND_EXPRESSION",
    value: NodeAtom | NodeCall,
}

export interface NodeIdentifier extends Node {
    kind: "ND_IDENTIFIER",
    value: string,
}

export interface ParseError extends Node {
    kind: "ND_ERROR",
    value: string,
}

export function parse_expression(tokens: readonly Token[], index: number = 0): Node {
    if (is_tk_number(tokens[index])) {
        return {kind: "ND_ATOM", value: tokens[0].value} as NodeAtom;
    }
    else {
        return {kind: "ND_ERROR", value: "unknown parsing error"} as ParseError;
    }
}
