// Copyright (c) 2025 Marco Nikander

import { Error, Result, ok, fail, is_error, is_ok } from "../src/error";
import { Item } from "../src/item";
import { is_token, Token } from "../src/token";

export type Nested_Expression = Nested_Atom | Nested_Call | Nested_Lambda | Nested_Let | Nested_If;
export type Nested_Atom       = Nested_Identifier | Nested_Boolean | Nested_Number | Nested_String;
export type Nested_Boolean    = {id: number, token: number, kind: 'Nested_Boolean', value: boolean};
export type Nested_Number     = {id: number, token: number, kind: 'Nested_Number', value: number};
export type Nested_String     = {id: number, token: number, kind: 'Nested_String', value: string};
export type Nested_Identifier = {id: number, token: number, kind: 'Nested_Identifier', name: string};
export type Nested_Reference  = {id: number, token: number, kind: 'Nested_Reference', target: string};
export type Nested_Call       = {id: number, token: number, kind: 'Nested_Call', fn: Nested_Expression, arg: Nested_Expression};
export type Nested_Lambda     = {id: number, token: number, kind: 'Nested_Lambda', binding: Nested_Identifier, body: Nested_Expression};
export type Nested_Let        = {id: number, token: number, kind: 'Nested_Let', binding: Nested_Identifier, value: Nested_Expression, body: Nested_Expression};
export type Nested_If         = {id: number, token: number, kind: 'Nested_If', condition: Nested_Expression, if_true: Nested_Expression, if_false: Nested_Expression};

type State = { index: number, node_count: number, tokens: readonly Token[] };

export function parse(tokens: Result<readonly Token[]>) : Result<[number, Nested_Expression]> {
    if (is_error(tokens)) return tokens;
    else {
        const parser: State = skip_whitespace({ index: 0, node_count: 0, tokens: tokens.value });
        let result: Result<[State, Nested_Expression]> = expr(parser);

        if (is_ok(result)) {
            if (is_at_end(parser)) {
                return ok( [result.value[0].node_count, result.value[1]] );
            }
            else {
                return fail("Parsing", "invalid expression at", parser.index);
            }
        }
        else {
            return {ok: false, error: result.error };
        }
    }
}

function expr(parser: State): Result<[State, Nested_Expression]> {
    let result: Result<[State, Nested_Expression]> = fail("Parsing", "unable to start parsing", parser.index);

    if (parser.index < parser.tokens.length) {
        result = bool(parser);
        if(is_ok(result)) { return result; }

        result = num(parser);
        if(is_ok(result)) { return result; }

        result = str(parser);
        if(is_ok(result)) { return result; }

        result = iden(parser);
        if(is_ok(result)) { return result; }

        return fail("Parsing", "unknown token", parser.index);
    }
    else {
        return fail("Parsing", "ran out of tokens to parse", parser.index);
    }
}

function bool(parser: State): Result<[State, Nested_Boolean]> {
    const current: Token = parser.tokens[parser.index];
    if (is_token.boolean(current)) {
        const node: Nested_Boolean = { id: parser.node_count, token: parser.index, kind: "Nested_Boolean", value: current.value};
        parser.index++;
        parser.node_count++;
        return ok([parser, node]);
    }
    else {
        return fail("Parsing", "expected a boolean", parser.index);
    }
}

function num(parser: State): Result<[State, Nested_Number]> {
    const current: Token = parser.tokens[parser.index];
    if (is_token.number(current)) {
        const node: Nested_Number = { id: parser.node_count, token: parser.index, kind: "Nested_Number", value: current.value};
        parser.index++;
        parser.node_count++;
        return ok([parser, node]);
    }
    else {
        return fail("Parsing", "expected a number", parser.index);
    }
}

function str(parser: State): Result<[State, Nested_String]> {
    const current: Token = parser.tokens[parser.index];
    if (is_token.string(current)) {
        const node: Nested_String = { id: parser.node_count, token: parser.index, kind: "Nested_String", value: current.value};
        parser.index++;
        parser.node_count++;
        return ok([parser, node]);
    }
    else {
        return fail("Parsing", "expected a string", parser.index);
    }
}

function iden(parser: State): Result<[State, Nested_Identifier]> {
    const current: Token = parser.tokens[parser.index];
    if (is_token.identifier(current)) {
        const node: Nested_Identifier = { id: parser.node_count, token: parser.index, kind: "Nested_Identifier", name: current.value};
        parser.index++;
        parser.node_count++;
        return ok([parser, node]);
    }
    else {
        return fail("Parsing", "expected an identifier", parser.index);
    }
}

function skip_whitespace(parser: State): State {
    while (parser.index < parser.tokens.length && is_token.whitespace(parser.tokens[parser.index])) {
        parser.index++;
    }
    return parser;
}

function is_at_end(parser: State): boolean {
    return parser.index == parser.tokens.length;
}
