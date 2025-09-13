// Copyright (c) 2025 Marco Nikander

import { Token, TokenBoolean, TokenNumber, TokenString, TokenIdentifier, is_token, TokenOpen, TokenWhitespace } from "./../src/token";

export type Value           = boolean | number;
export type Id              = {id: number};
export type Flat_Literal    = {id: number, token: number, kind: 'Flat_Literal', value: (boolean | number | string)};
export type Flat_Identifier = {id: number, token: number, kind: 'Flat_Identifier', name: string};
export type Flat_Reference  = {id: number, token: number, kind: 'Flat_Reference', target: Id};
export type Flat_Lambda     = {id: number, token: number, kind: 'Flat_Lambda', binding: Id, body: Id};
export type Flat_Let        = {id: number, token: number, kind: 'Flat_Let', binding: Id, value: Id, body: Id};
export type Flat_Call       = {id: number, token: number, kind: 'Flat_Call', body: Id, arg: Id};
export type Flat_Plus       = {id: number, token: number, kind: 'Flat_Plus'};
export type Flat_Minus      = {id: number, token: number, kind: 'Flat_Minus'};
export type Flat_Node       = Flat_Literal | Flat_Identifier | Flat_Reference | Flat_Lambda | Flat_Let | Flat_Call | Flat_Plus | Flat_Minus;
export type Flat_Atom       = Flat_Literal | Flat_Identifier;
export type Flat_AST        = Flat_Node[];

// TODO: implement built-in functions capable of partial application
//       and give them pre-reserved IDs

export function is_literal(expr: Flat_Node, ast: Flat_AST): expr is Flat_Literal { return expr.kind === 'Flat_Literal'; }
export function is_identifier(expr: Flat_Node, ast: Flat_AST): expr is Flat_Identifier { return expr.kind === 'Flat_Identifier'; }
export function is_reference(expr: Flat_Node, ast: Flat_AST): expr is Flat_Reference { return expr.kind === 'Flat_Reference'; }
export function is_lambda(expr: Flat_Node, ast: Flat_AST): expr is Flat_Lambda { return expr.kind === 'Flat_Lambda'; }
export function is_let(expr: Flat_Node, ast: Flat_AST): expr is Flat_Let { return expr.kind === 'Flat_Let'; }
export function is_call(expr: Flat_Node, ast: Flat_AST): expr is Flat_Call { return expr.kind === 'Flat_Call'; }
export function is_plus(expr: Flat_Node, ast: Flat_AST): expr is Flat_Plus { return expr.kind === 'Flat_Plus'; }
export function is_minus(expr: Flat_Node, ast: Flat_AST): expr is Flat_Minus { return expr.kind === 'Flat_Minus'; }


// I need to:
// - iterate over the tokens
// - create AST nodes in the array, and give them their node Ids
// - output possible errors
// - error output could be either individual, possibly using exceptions, or accumulated as a list

type State = { token_counter: number, parameter_counter: number, tokens: readonly Token[], ast: Flat_Node[] };

export function parse(tokens: readonly Token[]): Flat_Node[] {
    let state: State = { token_counter: 0, parameter_counter: 0, tokens, ast: [] };
    state = line(state);
    state = link_parameters(state);
    return state.ast;
}

// line = expr *space
function line(state: State): State {
    state = expr(state);
    state = consume_all_whitespace(state);
    if (state.token_counter == state.tokens.length) {
        return state;
    }
    else {
        throw new Error(`Expected a single expression, but got a second expression at token '${state.tokens[state.token_counter].value}' instead`)
    }
}

// expr = atom / call
function expr(state: State): State {
    const token = peek(state);
    if (is_atom(token)) {
        state = atom(state);
    }
    else if (is_open(token)) {
        state = call(state);
    }
    else {
        throw new Error(`Cannot parse token '${state.tokens[state.token_counter].value}'`);
    }
    return state;
}

// atom = boolean / number / string / identifier
function atom(state: State): State {
    const token: Token = peek(state);
    // boolean / number / string
    if (is_token.boolean(token) || is_token.number(token) || is_token.string(token)) {
        state.ast.push({ id: state.ast.length, token: state.token_counter, kind: 'Flat_Literal', value: token.value });
        state = consume(state);
    }
    // identifier
    else if (is_token.identifier(token)) {
        state.ast.push({ id: state.ast.length, token: state.token_counter, kind: 'Flat_Identifier', name: token.value });
        state = consume(state);
    }
    else {
        throw new Error(`Expected an atom, but got token '${state.tokens[state.token_counter].value}' instead`);
    }
    return state;
}

// TODO: I need to distinguish between a unary function call, a lambda, and a let-binding if I want to use hard-coded
// types with a fixed number of arguments

// call = open *space expr *(space *space expr) *space close
function call(state: State): State {
    let token: Token;
    
    // open
    token = peek(state);
    if (is_opening(token)) {
        // TODO: find a way to link both arguments correctly, instead of hardcoding the last one to -1
        state.ast.push({ id: state.ast.length, token: state.token_counter, kind: 'Flat_Call', body: { id: state.ast.length+1 }, arg: { id: state.parameter_counter-1 }});
        state.parameter_counter--;
        state = consume(state); // consume open paren
    }
    else {
        throw new Error(`Expected an '(', got token '${state.tokens[state.token_counter].value}' instead`);
    }

    // *space
    state = consume_all_whitespace(state);

    // expr
    token = peek(state);
    if (is_expr(token)) {
        state = expr(state);
    }
    else {
        throw new Error(`Expected an expression, got token '${state.tokens[state.token_counter].value}' instead`);
    }

    // *(space *space expr) *space
    while (is_in_bounds(state) && !is_closing(peek(state))) {
        // space
        token = peek(state);
        if (is_whitespace(token)) {
            state = consume(state);
        }
        else {
            throw new Error(`Expected a whitespace to separate function arguments, got token '${state.tokens[state.token_counter].value}' instead`);
        }

        // *space
        state = consume_all_whitespace(state);

        // expr
        token = peek(state);
        if (is_expr(token)) {
            state = expr(state);
        }
        else if (is_closing(token)) {
            // NOTE: trailing whitespace inside parentheses, such as `(false )` can trick us into thinking it is a list
            // of several parameters, although it is not. If we have seen a space, but then suddenly see a closing
            // parenthesis instead of the next expression, we break out of the loop. To avoid being tricked.
            break;
        }
        else {
            throw new Error(`Expected an expression or ')', got token '${state.tokens[state.token_counter].value}' instead`);
        }
    }

    // close
    token = peek(state);
    if (is_closing(token)) {
        state = consume(state);
    }
    else {
        throw new Error(`Expected an ')', got token '${state.tokens[state.token_counter].value}' instead`);
    }

    return state;
}

function peek(state: State): Token {
    if (state.token_counter < state.tokens.length) {
        return state.tokens[state.token_counter];
    }
    else {
        throw new Error("Tried to peek at the current token, but there are no more tokens to look at");
    }
}

function lookahead(state: State): Token {
    if (state.token_counter + 1 < state.tokens.length) {
        return state.tokens[state.token_counter + 1];
    }
    else {
        throw new Error("Tried to look ahead one token, but there are no more tokens to look at");
    }
}

function consume_all_whitespace(state: State): State {
    while (state.token_counter < state.tokens.length && is_token.whitespace(state.tokens[state.token_counter])) {
        state.token_counter++;
    }
    return state;
}

function consume(state: State): State {
    if (state.token_counter < state.tokens.length) {
        state.token_counter++;
        return state;
    }
    else {
        throw new Error('Tried to consume a token, but there are no more tokens to consume')
    }
}

function is_opening(token: Token): token is TokenOpen {
    return is_token.open(token);
}

function is_closing(token: Token): token is TokenOpen {
    return is_token.close(token);
}

function is_open(token: Token): token is TokenOpen {
    return is_token.open(token);
}

function is_expr(token: Token): token is (TokenBoolean | TokenNumber | TokenString | TokenIdentifier | TokenOpen) {
    return is_atom(token) || is_open(token);
}

function is_atom(token: Token): token is (TokenBoolean | TokenNumber | TokenString | TokenIdentifier) {
    return is_token.boolean(token) || is_token.number(token) || is_token.string(token) || is_token.identifier(token);
}

function is_whitespace(token: Token): token is TokenWhitespace {
    return is_token.whitespace(token);
}

function is_in_bounds(state: State): boolean {
    return state.token_counter < state.tokens.length;
}

function link_parameters(state: State): State {
    for (let i=0; i<state.ast.length; ++i) {
        let node: Flat_Node = state.ast[i];
        if (node.kind === 'Flat_Call' && node.arg.id <= 0) {
            node.arg.id = state.ast.length + node.arg.id;
        }
    }
    return state;
}
