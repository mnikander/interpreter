// Copyright (c) 2025 Marco Nikander

import { Token, TokenBoolean, TokenNumber, TokenString, TokenIdentifier, is_token_boolean, is_token_number, is_token_string, is_token_identifier, is_token_open, is_token_close, is_token_whitespace, is_token_keyword, is_token_lambda, is_token_let, is_token_if, is_token_eof } from "./lexer";
import { remove_whitespace } from "./whitespace";

export type Nested_Expression = Nested_Atom | Nested_Call | Nested_Lambda | Nested_Let | Nested_If;
export type Nested_Atom       = Nested_Identifier | Nested_Binding | Nested_Boolean | Nested_Number | Nested_String;
export type Nested_Boolean    = {id: number, token: number, tag: 'Nested_Boolean', value: boolean};
export type Nested_Number     = {id: number, token: number, tag: 'Nested_Number', value: number};
export type Nested_String     = {id: number, token: number, tag: 'Nested_String', value: string};
export type Nested_Identifier = {id: number, token: number, tag: 'Nested_Identifier', name: string};
export type Nested_Binding    = {id: number, token: number, tag: 'Nested_Binding', name: string};
export type Nested_Reference  = {id: number, token: number, tag: 'Nested_Reference', target: string};
export type Nested_Lambda     = {id: number, token: number, tag: 'Nested_Lambda', binding: Nested_Binding, body: Nested_Expression};
export type Nested_Let        = {id: number, token: number, tag: 'Nested_Let', binding: Nested_Binding, value: Nested_Expression, body: Nested_Expression};
export type Nested_If         = {id: number, token: number, tag: 'Nested_If', condition: Nested_Expression, then_branch: Nested_Expression, else_branch: Nested_Expression};
export type Nested_Call       = {id: number, token: number, tag: 'Nested_Call', fn: Nested_Expression, arg: Nested_Expression};

export function is_expression(expr: Nested_Expression): expr is Nested_Expression { return is_atom(expr) || is_lambda(expr) || is_let(expr) || is_call(expr); }
export function is_atom(expr: Nested_Expression): expr is Nested_Atom { return is_identifier(expr) || is_boolean(expr) || is_number(expr) || is_string(expr); }
export function is_boolean(expr: Nested_Expression): expr is Nested_Boolean { return expr.tag === 'Nested_Boolean'; }
export function is_number(expr: Nested_Expression): expr is Nested_Number { return expr.tag === 'Nested_Number'; }
export function is_string(expr: Nested_Expression): expr is Nested_String { return expr.tag === 'Nested_String'; }
export function is_identifier(expr: Nested_Expression): expr is Nested_Identifier { return expr.tag === 'Nested_Identifier'; }
export function is_binding(expr: Nested_Expression): expr is Nested_Binding { return expr.tag === 'Nested_Binding'; }
export function is_lambda(expr: Nested_Expression): expr is Nested_Lambda { return expr.tag === 'Nested_Lambda'; }
export function is_let(expr: Nested_Expression): expr is Nested_Let { return expr.tag === 'Nested_Let'; }
export function is_if(expr: Nested_Expression): expr is Nested_If { return expr.tag === 'Nested_If'; }
export function is_call(expr: Nested_Expression): expr is Nested_Call { return expr.tag === 'Nested_Call'; }

class Parser {
    index: number;
    node_count: number;
    readonly tokens: readonly Token[];

    constructor(tokens: readonly Token[]) {
        this.index = 0;
        this.node_count = 0;
        this.tokens = remove_whitespace(tokens);
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

    emit(): number {
        const id = this.node_count;
        this.node_count++;
        return id;
    }

    is_at_end(): boolean {
        return is_token_eof(this.peek());
    }

    expr(): Nested_Expression {

        if(this.is_at_end()) {
            throw Error(`Parser::expr() is out-of-bounds (token ${this.index} of ${this.tokens.length})`);
        }

        if (is_token_boolean(this.peek())) {
            this.consume();
            const id = this.emit();
            return { id: id, token: this.index-1, tag: "Nested_Boolean", value: (this.previous() as TokenBoolean).value };
        }
        else if (is_token_number(this.peek())) {
            this.consume();
            const id = this.emit();
            return { id: id, token: this.index-1, tag: "Nested_Number", value: (this.previous() as TokenNumber).value };
        }
        else if (is_token_string(this.peek())) {
            this.consume();
            const id = this.emit();
            return { id: id, token: this.index-1, tag: "Nested_String", value: (this.previous() as TokenString).value };
        }
        else if (is_token_identifier(this.peek())) {
            this.consume();
            const id = this.emit();
            return { id: id, token: this.index-1, tag: "Nested_Identifier", name: (this.previous() as TokenIdentifier).value };
        }
        else if (is_token_open(this.peek())) {
            this.consume();
            
            const potential_keyword: Token = this.peek();
            if (is_token_lambda(potential_keyword)) {
                return this.lambda();
            }
            else if (is_token_let(potential_keyword)) {
                return this.letbind();
            }
            else if (is_token_if(potential_keyword)) {
                return this.iff();
            }
            else {
                return this.call();
            }
        }
        else if (is_token_close(this.peek())) {
            throw Error(`Expected an expression but got ')' instead (token ${this.index} of ${this.tokens.length})`);
        }
        else {
            throw Error(`Unknown token tag '${this.peek()}' (token ${this.index} of ${this.tokens.length})`);
        }
    }

    // (lambda identifier expr)
    lambda(): Nested_Lambda {
        // we store the node_id, since we need the ids in pre-order, but construct the AST via post-order recursion
        const id = this.emit();
        const potential_keyword: Token = this.peek();
        this.consume();

        if (!is_token_identifier(this.peek())) {
            throw new Error(`Expected an 'lambda' to be followed by an identifier but got a ${this.peek().lexeme} instead (token ${this.index} of ${this.tokens.length})`);
        }
        else {
            const variable: Nested_Binding = this.binding();
            const body: Nested_Expression = this.expr();
            this.expect_closing();
            return { id: id, token: potential_keyword.id-1, tag: "Nested_Lambda", binding: variable, body: body };
        }
    }

    // (let identifier expr expr)
    letbind(): Nested_Let {
        // we store the node_id, since we need the ids in pre-order, but construct the AST via post-order recursion
        const id = this.emit();
        const potential_keyword: Token = this.peek();
        this.consume();

        if (!is_token_identifier(this.peek())) {
            throw new Error(`Expected an 'let' to be followed by an identifier but got a ${this.peek().lexeme} instead (token ${this.index} of ${this.tokens.length})`);
        }
        else {
            const variable: Nested_Binding = this.binding();
            const value: Nested_Expression = this.expr();
            const body: Nested_Expression = this.expr();
            this.expect_closing();
            return { id: id, token: potential_keyword.id-1, tag: "Nested_Let", binding: variable, value: value, body: body };
        }
    }

    // (if expr expr expr)
    iff(): Nested_If {
        // we store the node_id, since we need the ids in pre-order, but construct the AST via post-order recursion
        const id = this.emit();
        const potential_keyword: Token = this.peek();
        this.consume();

        const condition: Nested_Expression = this.expr();
        const then_branch: Nested_Expression = this.expr();
        const else_branch: Nested_Expression = this.expr();
        this.expect_closing();
        return { id: id, token: potential_keyword.id-1, tag: "Nested_If", condition: condition, then_branch: then_branch, else_branch: else_branch };
    }

    // (expr expr)
    call(): Nested_Call {
        // we store the node_id, since we need the ids in pre-order, but construct the AST via post-order recursion
        const id = this.emit();

        const fn: Nested_Expression = this.expr();
        const arg: Nested_Expression = this.expr();
        this.expect_closing();
        return { id: id, token: fn.token-1, tag: "Nested_Call", fn: fn, arg: arg };
    }

    binding(): Nested_Binding {
        const id = this.emit();
        const token = (this.peek() as TokenIdentifier);
        this.consume();
        return { id: id, token: token.id, tag: "Nested_Binding", name: token.value };
    }

    expect_closing() {
        if (this.is_at_end()) {
            throw Error(`Parser::expect_closing() is out-of-bounds (token ${this.index} of ${this.tokens.length})`);
        }
        else {
            if (is_token_close(this.peek())) {
                this.consume();
            }
            else {
                throw new Error(`Expected ')' but got a '${this.peek().lexeme}' instead (token ${this.index} of ${this.tokens.length})`);
            }
        }
    }
}

export function parse(tokens: readonly Token[]) : { ast: Nested_Expression, node_count: number } {
    let parser = new Parser(tokens);
    const expression: Nested_Expression = parser.expr();

    if (parser.is_at_end()) {
        return { ast: expression, node_count: parser.node_count };
    }
    else {
        throw Error(`Expected a single expression, failed to fully parse input (token ${parser.index} of ${parser.tokens.length})`);
    }
}
