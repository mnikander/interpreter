// Copyright (c) 2025 Marco Nikander

import { Token, TokenBoolean, TokenNumber, TokenString, TokenIdentifier, is_token } from './lexer';
import { remove_whitespace } from './whitespace';

export type _Expression = _Atom | _Call | _Lambda | _Let | _If;
export type _Atom       = _Identifier | _Binding | _Boolean | _Number | _String;
export type _Boolean    = {id: number, token: number, tag: '_Boolean', value: boolean};
export type _Number     = {id: number, token: number, tag: '_Number', value: number};
export type _String     = {id: number, token: number, tag: '_String', value: string};
export type _Identifier = {id: number, token: number, tag: '_Identifier', name: string};
export type _Binding    = {id: number, token: number, tag: '_Binding', name: string};
export type _Reference  = {id: number, token: number, tag: '_Reference', target: string};
export type _Lambda     = {id: number, token: number, tag: '_Lambda', binding: _Binding, body: _Expression};
export type _Let        = {id: number, token: number, tag: '_Let', binding: _Binding, value: _Expression, body: _Expression};
export type _If         = {id: number, token: number, tag: '_If', condition: _Expression, then_branch: _Expression, else_branch: _Expression};
export type _Call       = {id: number, token: number, tag: '_Call', fn: _Expression, arg: _Expression};

export function is_expression(expr: _Expression): expr is _Expression { return is_atom(expr) || is_lambda(expr) || is_let(expr) || is_call(expr); }
export function is_atom(expr: _Expression): expr is _Atom { return is_identifier(expr) || is_boolean(expr) || is_number(expr) || is_string(expr); }
export function is_boolean(expr: _Expression): expr is _Boolean { return expr.tag === '_Boolean'; }
export function is_number(expr: _Expression): expr is _Number { return expr.tag === '_Number'; }
export function is_string(expr: _Expression): expr is _String { return expr.tag === '_String'; }
export function is_identifier(expr: _Expression): expr is _Identifier { return expr.tag === '_Identifier'; }
export function is_binding(expr: _Expression): expr is _Binding { return expr.tag === '_Binding'; }
export function is_lambda(expr: _Expression): expr is _Lambda { return expr.tag === '_Lambda'; }
export function is_let(expr: _Expression): expr is _Let { return expr.tag === '_Let'; }
export function is_if(expr: _Expression): expr is _If { return expr.tag === '_If'; }
export function is_call(expr: _Expression): expr is _Call { return expr.tag === '_Call'; }

export function parse(tokens: readonly Token[]) : { ast: _Expression, node_count: number } {
    let parser = new Parser(remove_whitespace(tokens));
    const expression: _Expression = parser.expr();

    if (parser.is_at_end()) {
        return { ast: expression, node_count: parser.node_count };
    }
    else {
        throw Error(`Expected a single expression, failed to fully parse input`);
    }
}

class Parser {
    index: number;
    node_count: number;
    readonly tokens: readonly Token[];

    constructor(tokens: readonly Token[]) {
        this.index      = 0;
        this.node_count = 0;
        this.tokens     = tokens;
    }

    peek(): Token {
        if (0 <= this.index && this.index < this.tokens.length) {
            return this.tokens[this.index];
        }
        else {
            throw Error(`Parser::peek() is out-of-bounds`);
        }
    }
    
    previous(): Token {
        if (1 <= this.index && this.index < this.tokens.length + 1) {
            return this.tokens[this.index-1];
        }
        else {
            throw Error(`Parser::previous() is out-of-bounds`);
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
        return is_token(this.peek(), 'EOF');
    }

    expr(): _Expression {

        if(this.is_at_end()) {
            throw Error(`Parser::expr() is out-of-bounds`);
        }

        if (is_token(this.peek(), 'BOOLEAN')) {
            this.consume();
            const id = this.emit();
            return { id: id, token: this.index-1, tag: '_Boolean', value: (this.previous() as TokenBoolean).value };
        }
        else if (is_token(this.peek(), 'NUMBER')) {
            this.consume();
            const id = this.emit();
            return { id: id, token: this.index-1, tag: '_Number', value: (this.previous() as TokenNumber).value };
        }
        else if (is_token(this.peek(), 'STRING')) {
            this.consume();
            const id = this.emit();
            return { id: id, token: this.index-1, tag: '_String', value: (this.previous() as TokenString).value };
        }
        else if (is_token(this.peek(), 'IDENTIFIER')) {
            this.consume();
            const id = this.emit();
            return { id: id, token: this.index-1, tag: '_Identifier', name: (this.previous() as TokenIdentifier).value };
        }
        else if (is_token(this.peek(), 'OPEN')) {
            this.consume();
            
            const potential_keyword: Token = this.peek();
            if (is_token(potential_keyword, 'LAMBDA')) {
                return this.lambda();
            }
            else if (is_token(potential_keyword, 'LET')) {
                return this.letbind();
            }
            else if (is_token(potential_keyword, 'IF')) {
                return this.iff();
            }
            else {
                return this.call();
            }
        }
        else if (is_token(this.peek(), 'CLOSE')) {
            throw Error(`Expected an expression but got ')' instead`);
        }
        else {
            throw Error(`Unknown token tag '${this.peek()}'`);
        }
    }

    // (lambda identifier expr)
    lambda(): _Lambda {
        // we store the node_id, since we need the ids in pre-order, but construct the AST via post-order recursion
        const id = this.emit();
        const potential_keyword: Token = this.peek();
        this.consume();

        if (!is_token(this.peek(), 'IDENTIFIER')) {
            throw new Error(`Expected an 'lambda' to be followed by an identifier but got a ${this.peek().lexeme} instead`);
        }
        else {
            const variable: _Binding = this.binding();
            const body: _Expression = this.expr();
            this.expect_closing();
            return { id: id, token: potential_keyword.at-1, tag: '_Lambda', binding: variable, body: body };
        }
    }

    // (let identifier expr expr)
    letbind(): _Let {
        // we store the node_id, since we need the ids in pre-order, but construct the AST via post-order recursion
        const id = this.emit();
        const potential_keyword: Token = this.peek();
        this.consume();

        if (!is_token(this.peek(), 'IDENTIFIER')) {
            throw new Error(`Expected an 'let' to be followed by an identifier but got a ${this.peek().lexeme} instead`);
        }
        else {
            const variable: _Binding = this.binding();
            const value: _Expression = this.expr();
            const body: _Expression = this.expr();
            this.expect_closing();
            return { id: id, token: potential_keyword.at-1, tag: '_Let', binding: variable, value: value, body: body };
        }
    }

    // (if expr expr expr)
    iff(): _If {
        // we store the node_id, since we need the ids in pre-order, but construct the AST via post-order recursion
        const id = this.emit();
        const potential_keyword: Token = this.peek();
        this.consume();

        const condition: _Expression = this.expr();
        const then_branch: _Expression = this.expr();
        const else_branch: _Expression = this.expr();
        this.expect_closing();
        return { id: id, token: potential_keyword.at-1, tag: '_If', condition: condition, then_branch: then_branch, else_branch: else_branch };
    }

    // (expr expr)
    call(): _Call {
        // we store the node_id, since we need the ids in pre-order, but construct the AST via post-order recursion
        const id = this.emit();

        const fn: _Expression = this.expr();
        const arg: _Expression = this.expr();
        this.expect_closing();
        return { id: id, token: fn.token-1, tag: '_Call', fn: fn, arg: arg };
    }

    binding(): _Binding {
        const id = this.emit();
        const token = (this.peek() as TokenIdentifier);
        this.consume();
        return { id: id, token: token.at, tag: '_Binding', name: token.value };
    }

    expect_closing() {
        if (this.is_at_end()) {
            throw Error(`Expected ')' but went out-of-bounds`);
        }
        else {
            if (is_token(this.peek(), 'CLOSE')) {
                this.consume();
            }
            else {
                throw new Error(`Expected ')' but got '${this.peek().value}' of type '${this.peek().lexeme}' instead`);
            }
        }
    }
}
