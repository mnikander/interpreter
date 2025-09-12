// Copyright (c) 2025 Marco Nikander

import { ok, fail, is_error, is_ok, error_to_string } from "../src/error";
import { is_token, Token, TokenBoolean, TokenNumber, TokenString, TokenIdentifier, TokenOpen, TokenClose, TokenWhitespace } from "../src/token";
import { Result } from "../src/error";

export type Nested_Expression = Nested_Atom | Nested_Call | Nested_Lambda | Nested_Let | Nested_If;
export type Nested_Atom       = Nested_Identifier | Nested_Boolean | Nested_Number | Nested_String;
export type Nested_Boolean    = {id: number, token: number, kind: 'Nested_Boolean', value: boolean};
export type Nested_Number     = {id: number, token: number, kind: 'Nested_Number', value: number};
export type Nested_String     = {id: number, token: number, kind: 'Nested_String', value: string};
export type Nested_Identifier = {id: number, token: number, kind: 'Nested_Identifier', name: string};
export type Nested_Reference  = {id: number, token: number, kind: 'Nested_Reference', target: string};
export type Nested_Lambda     = {id: number, token: number, kind: 'Nested_Lambda', binding: Nested_Identifier, body: Nested_Expression};
export type Nested_Let        = {id: number, token: number, kind: 'Nested_Let', binding: Nested_Identifier, value: Nested_Expression, body: Nested_Expression};
export type Nested_If         = {id: number, token: number, kind: 'Nested_If', condition: Nested_Expression, if_true: Nested_Expression, if_false: Nested_Expression};
export type Nested_Call       = {id: number, token: number, kind: 'Nested_Call', fn: Nested_Expression, arg: Nested_Expression};

export function is_expression(expr: Nested_Expression): expr is Nested_Expression { return is_atom(expr) || is_lambda(expr) || is_let(expr) || is_call(expr); }
export function is_atom(expr: Nested_Expression): expr is Nested_Atom { return is_identifier(expr) || is_boolean(expr) || is_number(expr) || is_string(expr); }
export function is_boolean(expr: Nested_Expression): expr is Nested_Boolean { return expr.kind === 'Nested_Boolean'; }
export function is_number(expr: Nested_Expression): expr is Nested_Number { return expr.kind === 'Nested_Number'; }
export function is_string(expr: Nested_Expression): expr is Nested_String { return expr.kind === 'Nested_String'; }
export function is_identifier(expr: Nested_Expression): expr is Nested_Identifier { return expr.kind === 'Nested_Identifier'; }
export function is_lambda(expr: Nested_Expression): expr is Nested_Lambda { return expr.kind === 'Nested_Lambda'; }
export function is_let(expr: Nested_Expression): expr is Nested_Let { return expr.kind === 'Nested_Let'; }
export function is_if(expr: Nested_Expression): expr is Nested_If { return expr.kind === 'Nested_If'; }
export function is_call(expr: Nested_Expression): expr is Nested_Call { return expr.kind === 'Nested_Call'; }

class Parser {
    index: number;
    node_count: number;
    readonly tokens: readonly Token[];

    constructor(tokens: readonly Token[]) {
        this.index = 0;
        this.node_count = 0;
        this.tokens = tokens;
    }

    peek(): Token {
        if (0 <= this.index && this.index < this.tokens.length) {
            return this.tokens[this.index];
        }
        else {
            throw Error(`Parser::peek() is out-of-bounds (token ${this.index} of ${this.tokens.length})`);
        }
    }
    
    previous(): Token {
        if (1 <= this.index && this.index < this.tokens.length + 1) {
            return this.tokens[this.index-1];
        }
        else {
            throw Error(`Parser::previous() is out-of-bounds (token ${this.index} of ${this.tokens.length})`);
        }
    }

    consume() {
        this.index++;
    }

    emit() {
        this.node_count++;
    }

    is_more_tokens(): boolean {
        return this.index < this.tokens.length;
    }

    is_at_end(): boolean {
        return this.index === this.tokens.length;
    }

    expr(): Nested_Expression {

        if(this.is_at_end()) {
            throw Error(`Parser::expr() is out-of-bounds (token ${this.index} of ${this.tokens.length})`);
        }

        this.skip_whitespace();

        if (is_token.boolean(this.peek())) {
            this.consume();
            this.emit();
            return { id: this.node_count, token: this.index-1, kind: "Nested_Boolean", value: (this.previous() as TokenBoolean).value };
        }
        else if (is_token.number(this.peek())) {
            this.consume();
            this.emit();
            return { id: this.node_count, token: this.index-1, kind: "Nested_Number", value: (this.previous() as TokenNumber).value };
        }
        else if (is_token.string(this.peek())) {
            this.consume();
            this.emit();
            return { id: this.node_count, token: this.index-1, kind: "Nested_String", value: (this.previous() as TokenString).value };
        }
        else if (is_token.identifier(this.peek())) {
            this.consume();
            this.emit();
            return { id: this.node_count, token: this.index-1, kind: "Nested_Identifier", name: (this.previous() as TokenIdentifier).value };
        }
        else if (is_token.open(this.peek())) {
            this.consume();
            const node_id = this.node_count; // we store the node_id, since we need the ids in pre-order, but construct the AST via post-order recursion
            this.emit(); // we are going to emit an AST node of some kind, and we must increment the node counter BEFORE we go into the recursion
            this.skip_whitespace();
            
            const potential_keyword: Token = this.peek();
            if (is_token.identifier(potential_keyword) && potential_keyword.value === "lambda") { // (lambda identifier expr)
                this.consume();
                this.expect_whitespace();

                const variable: Nested_Expression = this.expr();
                if (!is_identifier(variable)) {
                    throw new Error(`Expected an 'lambda' to be followed by an identifier but got a ${this.peek().kind} instead (token ${this.index} of ${this.tokens.length})`);
                }
                else {
                    this.expect_whitespace();

                    const body: Nested_Expression = this.expr();
                    this.skip_whitespace();
                    this.expect_closing();
                    return { id: node_id, token: potential_keyword.id, kind: "Nested_Lambda", binding: variable, body: body };
                }
            }
            else if (is_token.identifier(potential_keyword) && potential_keyword.value === "let") { // (let identifier expr expr)
                this.consume();
                this.expect_whitespace();

                const variable: Nested_Expression = this.expr();
                if (!is_identifier(variable)) {
                    throw new Error(`Expected an 'let' to be followed by an identifier but got a ${this.peek().kind} instead (token ${this.index} of ${this.tokens.length})`);
                }
                else {
                    this.expect_whitespace();
                    const value: Nested_Expression = this.expr();
                    this.expect_whitespace();
                    const body: Nested_Expression = this.expr();
                    this.skip_whitespace();
                    this.expect_closing();
                    return { id: node_id, token: potential_keyword.id, kind: "Nested_Let", binding: variable, value: value, body: body };
                }
            }
            else if (is_token.identifier(potential_keyword) && potential_keyword.value === "if") { // (if expr expr expr)
                this.consume();

                this.expect_whitespace();
                const condition: Nested_Expression = this.expr();
                this.expect_whitespace();
                const if_true: Nested_Expression = this.expr();
                this.expect_whitespace();
                const if_false: Nested_Expression = this.expr();
                this.skip_whitespace();
                this.expect_closing();
                return { id: node_id, token: potential_keyword.id, kind: "Nested_If", condition: condition, if_true: if_true, if_false: if_false };
            }
            else { // (expr expr)
                const fn: Nested_Expression = this.expr();
                this.expect_whitespace();
                const arg: Nested_Expression = this.expr();
                this.skip_whitespace();
                this.expect_closing();
                return { id: node_id, token: potential_keyword.id, kind: "Nested_Call", fn: fn, arg: arg };
            }
        }
        else {
            throw Error(`Unknown token kind '${this.peek()}' (token ${this.index} of ${this.tokens.length})`);
        }
    }

    skip_whitespace() {
        while (!this.is_at_end() && is_token.whitespace(this.peek())) {
            this.consume();
        }
    }

    expect_whitespace() {
        if (this.is_at_end()) {
            throw Error(`Parser::expect_whitespace() is out-of-bounds (token ${this.index} of ${this.tokens.length})`);
        }
        else {
            if (is_token.whitespace(this.peek())) {
                this.consume();
            }
            else {
                throw new Error(`Expected whitespace but got a ${this.peek().kind} instead (token ${this.index} of ${this.tokens.length})`);
            }
        }
    }

    expect_closing() {
        if (this.is_at_end()) {
            throw Error(`Parser::expect_closing() is out-of-bounds (token ${this.index} of ${this.tokens.length})`);
        }
        else {
            if (is_token.close(this.peek())) {
                this.consume();
            }
            else {
                throw new Error(`Expected ')' but got a ${this.peek().kind} instead (token ${this.index} of ${this.tokens.length})`);
            }
        }
    }
}


export function parse(tokens: Result<readonly Token[]>) : { ast: Nested_Expression, node_count: number } {
    if (is_error(tokens)) {
        throw Error('Lexing failed');
    }
    else {
        let parser = new Parser(tokens.value);
        parser.skip_whitespace();
        const expression: Nested_Expression = parser.expr();
        parser.skip_whitespace();

        if (parser.is_at_end()) {
            return { ast: expression, node_count: parser.node_count };
        }
        else {
            throw Error(`Failed to parse input fully (token ${this.index} of ${this.tokens.length})`);
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
