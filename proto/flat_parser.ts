// Copyright (c) 2025 Marco Nikander

import { Token, TokenBoolean, TokenNumber, TokenString, TokenIdentifier, is_token, TokenOpen, TokenWhitespace } from "./../src/token";
import { Id, Constant, Identifier, Reference, Lambda, Let, Call, Plus, Minus, Node, Atom, AST, Value } from "./flat_ast";

// I need to:
// - iterate over the tokens
// - create AST nodes in the array, and give them their node Ids
// - output possible errors
// - error output could be either individual, possibly using exceptions, or accumulated as a list

type State = { token_counter: number, parameter_counter: number, tokens: readonly Token[], ast: Node[] };

export function parse(tokens: readonly Token[]): Node[] {
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
    else if (is_call(token)) {
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
        state.ast.push({ id: state.ast.length, token: state.token_counter, kind: 'Constant', value: token.value });
        state = consume(state);
    }
    // identifier
    else if (is_token.identifier(token)) {
        state.ast.push({ id: state.ast.length, token: state.token_counter, kind: 'Identifier', name: token.value });
        state = consume(state);
    }
    else {
        throw new Error(`Expected an atom, but got token '${state.tokens[state.token_counter].value}' instead`);
    }
    return state;
}

// call = open *space expr *(space *space expr) *space close
function call(state: State): State {
    let token: Token;
    
    // open
    token = peek(state);
    if (is_opening(token)) {
        // TODO: find a way to link both arguments correctly, instead of hardcoding the last one to -1
        state.ast.push({ id: state.ast.length, token: state.token_counter, kind: 'Call', body: { id: state.ast.length+1 }, arg: { id: state.parameter_counter-1 }});
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

function is_call(token: Token): token is TokenOpen {
    return is_token.open(token);
}

function is_expr(token: Token): token is (TokenBoolean | TokenNumber | TokenString | TokenIdentifier | TokenOpen) {
    return is_atom(token) || is_call(token);
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
        let node: Node = state.ast[i];
        if (node.kind === 'Call' && node.arg.id <= 0) {
            node.arg.id = state.ast.length + node.arg.id;
        }
    }
    return state;
}
