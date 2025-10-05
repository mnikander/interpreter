// Copyright (c) 2025 Marco Nikander

import { Item } from "../src/item";
import { Lexeme, Token, TokenBoolean, TokenIdentifier, TokenNumber, TokenString, is_token } from "../src/lexer";
import { remove_whitespace } from "../src/whitespace";

export type _Literal    = _Boolean | _Number | _String;
export type _Tail       = _Atomic  | _Call   | _Complex;
export type _Atomic     = _Literal | _Binding | _Identifier | _Lambda | _Block; 
export type _Complex    = _IfThenElse;
export type _Block      = {id?: number, token: number, tag: '_Block', let_bindings: _LetBind[], tail: _Tail};
export type _LetBind    = {id?: number, token: number, tag: '_LetBind', binding: _Binding, value: (_Atomic | _Call)};
export type _Lambda     = {id?: number, token: number, tag: '_Lambda', binding: _Binding, body: _Block};
export type _Call       = {id?: number, token: number, tag: '_Call', fn: _Atomic, arg: _Atomic};
export type _IfThenElse = {id?: number, token: number, tag: '_IfThenElse', condition: _Atomic, then_branch: _Block, else_branch: _Block};
export type _Binding    = {id?: number, token: number, tag: '_Binding', name: string};
export type _Identifier = {id?: number, token: number, tag: '_Identifier', name: string};
export type _Boolean    = {id?: number, token: number, tag: '_Boolean', value: boolean};
export type _Number     = {id?: number, token: number, tag: '_Number', value: number};
export type _String     = {id?: number, token: number, tag: '_String', value: string};

export function is_literal(expr: Item): expr is _Literal { return is_boolean(expr) || is_number(expr) || is_string(expr); }
export function is_tail(expr: Item): expr is _Tail { return is_atomic(expr) || is_call(expr) || is_complex(expr); }
export function is_atomic(expr: Item): expr is _Atomic { return is_literal(expr) || is_binding(expr) || is_identifier(expr) || is_lambda(expr) || is_block(expr); }
export function is_complex(expr: Item): expr is _Complex { return is_if(expr); }
export function is_block(expr: Item): expr is _Block { return expr.tag === '_Block'; }
export function is_let(expr: Item): expr is _LetBind { return expr.tag === '_LetBind'; }
export function is_lambda(expr: Item): expr is _Lambda { return expr.tag === '_Lambda'; }
export function is_call(expr: Item): expr is _Call { return expr.tag === '_Call'; }
export function is_if(expr: Item): expr is _IfThenElse { return expr.tag === '_IfThenElse'; }
export function is_binding(expr: Item): expr is _Binding { return expr.tag === '_Binding'; }
export function is_identifier(expr: Item): expr is _Identifier { return expr.tag === '_Identifier'; }
export function is_boolean(expr: Item): expr is _Boolean { return expr.tag === '_Boolean'; }
export function is_number(expr: Item): expr is _Number { return expr.tag === '_Number'; }
export function is_string(expr: Item): expr is _String { return expr.tag === '_String'; }

export type ParseError = { tag: 'ParseError', token: number, message: string };

// This parser is the stuff of nightmares because it:
// - works via attempting a rule and then rolling back if the rule fails, which makes for _really_ deep stack traces
// - it's slow because it doesn't use the single token look-ahead to decide what to do, it tries the rule and rolls back
// - state and error messages are threaded explicitly via a tuple (optional, optional, tokens) which is a really complicated design
//
// It's OK to want to thread the state explicitly, but the 'attempt a rule and rollback if needed' approach is complicated
// I could also just modify my OO-based parser for ANF.
// With look-ahead I can decide on the correct rule to apply, that means if an error still occurs there is no coming back -> throw an exception
// That will simplify the code drastically.
// I need to make sure to remove the ambiguity from my grammar, by introducing a Call_or_Atomic rule,
// which handles the ambiguity between ATOMIC and ATOMIC ATOMIC i.e. a function call


export function parse(tokens: readonly Token[]): _Block {
    const [error, ast, leftovers] = block(remove_whitespace(tokens));

    if (!error && ast && is_token(leftovers[0], 'EOF')) {
        return ast;
    }
    else if (error) 
    {
        throw Error(error.message);
    }
    else if (!ast) {
        throw Error(`Something went badly wrong during parsing. There is no proper error message and the abstract syntax tree is empty. @(x_x)@`);
    }
    else {
        throw Error(`Expected a single block of code, stopped parsing at token '${leftovers[0].value}' of type '${leftovers[0].lexeme}'.`);
    }
}

function consume(tokens: readonly Token[], lexeme: Lexeme): [(undefined | ParseError), undefined, Token[]] {
    const [first, ...rest] = tokens;
    if (is_token(first, lexeme)) {
        return [undefined, undefined, rest];
    }
    else {
        return [{
            tag: 'ParseError',
            token: first.at,
            message: `Expected a ${lexeme}. Got '${first.value}' of type '${first.lexeme}' instead.`,
        }, undefined, [...tokens]];
    }
}

function literal(tokens: readonly Token[]): [(undefined | ParseError), (undefined | _Literal), Token[]] {
    const [first, ...rest] = tokens;
    if (is_token(first, 'BOOLEAN')) {
        return [undefined, {token: first.at, tag: "_Boolean", value: (first as TokenBoolean).value}, rest];
    }
    else if (is_token(first, 'NUMBER')) {
        return [undefined, {token: first.at, tag: "_Number", value: (first as TokenNumber).value}, rest];
    }
    else if (is_token(first, 'STRING')) {
        return [undefined, {token: first.at, tag: "_String", value: (first as TokenString).value}, rest];
    }
    else {
        return [{
            tag: 'ParseError',
            token: first.at,
            message: `Expected boolean, number, or string literal. Got '${first.value}' of type '${first.lexeme}' instead.`,
        }, undefined, [...tokens]];
    }
}

function tail(tokens: readonly Token[]): [(undefined | ParseError), (undefined | _Tail), Token[]] {
    const first = tokens[0];
    let error: undefined | ParseError = undefined;
    let ast: undefined   | _Tail      = undefined;
    let rest: Token[]                 = [...tokens];

    [error, ast, rest] = call(tokens);
    if (!error) {
        return [error, ast, rest];
    }

    [error, ast, rest] = atomic(tokens);
    if (!error) {
        return [error, ast, rest];
    }

    [error, ast, rest] = complex(tokens);
    if (!error) {
        return [error, ast, rest];
    }

    return [{
        tag: 'ParseError',
        token: first.at,
        message: `Expected literal, identifier, lambda, block, call, or complex control-flow. Got '${first.value}' of type '${first.lexeme}' instead.`,
    }, undefined, [...tokens]];
}

function atomic(tokens: readonly Token[]): [(undefined | ParseError), (undefined | _Atomic), Token[]] {
    const first = tokens[0];
    let error: undefined | ParseError = undefined;
    let ast: undefined   | _Atomic    = undefined;
    let rest: Token[]                 = [...tokens];

    [error, ast, rest] = literal(tokens);
    if (!error && ast) {
        return [error, ast, rest];
    }

    [error, ast, rest] = identifier(tokens);
    if (!error && ast) {
        return [error, ast, rest];
    }
    
    [error, ast, rest] = lambda(tokens);
    if (!error && ast) {
        return [error, ast, rest];
    }

    [error, ast, rest] = block(tokens);
    if (!error && ast) {
        return [error, ast, rest];
    }

    return [{
        tag: 'ParseError',
        token: first.at,
        message: `Expected literal, identifier, lambda, or block. Got '${first.value}' of type '${first.lexeme}' instead.`,
    }, undefined, [...tokens]];
}

function complex(tokens: readonly Token[]): [(undefined | ParseError), (undefined | _Complex), Token[]] {
    const first = tokens[0];
    let error: undefined | ParseError = undefined;
    let ast: undefined   | _Complex   = undefined;
    let rest: Token[]                 = [...tokens];

    [error, ast, rest] = if_then_else(tokens);
    if (!error && ast) {
        return [error, ast, rest];
    }

    return [{
        tag: 'ParseError',
        token: first.at,
        message: `Expected if-then-else. Got '${first.value}' of type '${first.lexeme}' instead.`,
    }, undefined, [...tokens]];
}

function block(tokens: readonly Token[]): [(undefined | ParseError), (undefined | _Block), Token[]] {
    let error: undefined | ParseError     = undefined;
    let ast: undefined | _LetBind | _Tail = undefined;
    let [first, ...rest] = tokens;

    let let_bindings: _LetBind[] = [];

    [error, ast, rest] = consume(tokens, 'OPEN');
    if (error) return [error, ast, [...tokens]];

    while (is_token(rest[0], 'LET')) { // Kleene star on let bindings
        [error, ast, rest] = letbind(rest);
        if (!error && ast) {
            let_bindings.push(ast);
        }
        else {
            return [error, undefined, rest];
        }
    }

    [error, ast, rest] = tail(rest);
    if (!error && ast) {
        const b: _Block = { token: first.at, tag: "_Block", let_bindings: let_bindings, tail: ast};
        [error, ast, rest] = consume(rest, 'CLOSE');
        if (error) return [error, ast, [...tokens]];
        else return [undefined, b, rest];
    }
    else {
        return [{
            tag: 'ParseError',
            token: first.at,
            message: `Expected zero or more let-bindings followed by a tail-expression. Got '${first.value}' of type '${first.lexeme}' instead.`,
        }, undefined, [...tokens]];
    }
}

function letbind(tokens: readonly Token[]): [(undefined | ParseError), (undefined | _LetBind), Token[]] {
    let error: undefined | ParseError               = undefined;
    let ast: undefined | _Binding | _Atomic | _Call = undefined;
    const first = tokens[0];
    let [...rest] = tokens;
    let variable: undefined | _Binding;
    let value: undefined | _Atomic | _Call;
    
    [error, ast, rest] = consume(rest, 'LET');
    if (error) return [error, ast, [...tokens]];

    [error, variable, rest] = binding(rest);
    if (error) return [error, ast, [...tokens]];

    [error, ast, rest] = consume(rest, 'ASSIGN');
    if (error) return [error, ast, [...tokens]];

    [error, value, rest] = call(rest);
    if (error) {
        [error, value, rest] = atomic(rest);
    }
    if (error) {
        [{
            tag: 'ParseError',
            token: first.at,
            message: `Expected atom or call. Got '${rest[0].value}' of type '${rest[0].lexeme}' instead.`,
        }, undefined, [...tokens]];
    }
    
    [error, ast, rest] = consume(rest, 'IN');
    if (error) return [error, ast, [...tokens]];

    const result: _LetBind = { token: first.at, tag: '_LetBind', binding: (variable as _Binding), value: (value as _Atomic | _Call) };
    return [undefined, result, rest];
}

function lambda(tokens: readonly Token[]): [(undefined | ParseError), (undefined | _Lambda), Token[]] {
    let error: undefined | ParseError               = undefined;
    let ast: undefined | _Binding | _Atomic | _Call = undefined;
    const first = tokens[0];
    let [...rest] = tokens;
    let variable: undefined | _Binding;
    let body: undefined | _Block;
    
    [error, ast, rest] = consume(rest, 'LAMBDA');
    if (error) return [error, ast, [...tokens]];

    [error, variable, rest] = binding(rest);
    if (error) return [error, ast, [...tokens]];

    [error, body, rest] = block(rest);
    if (error) return [error, ast, [...tokens]];

    const result: _Lambda = { token: first.at, tag: '_Lambda', binding: (variable as _Binding), body: (body as _Block) };
    return [undefined, result, rest];
}

function call(tokens: readonly Token[]): [(undefined | ParseError), (undefined | _Call), Token[]] {
    let error: undefined | ParseError = undefined;
    let ast: undefined | _Atomic      = undefined;
    const first = tokens[0];
    let [...rest] = tokens;
    let fn: undefined | _Atomic;
    let arg: undefined | _Atomic;
    
    [error, fn, rest] = atomic(rest);
    if (error) return [error, ast, [...tokens]];

    [error, arg, rest] = atomic(rest);
    if (error) return [error, ast, [...tokens]];

    const result: _Call = { token: first.at, tag: '_Call', fn: (fn as _Atomic), arg: (arg as _Atomic) };
    return [undefined, result, rest];
}

function if_then_else(tokens: readonly Token[]): [(undefined | ParseError), (undefined | _IfThenElse), Token[]] {
    let error: undefined | ParseError               = undefined;
    let ast: undefined | _Binding | _Atomic | _Call = undefined;
    const first = tokens[0];
    let [...rest] = tokens;
    let condition: undefined | _Atomic;
    let then_branch: undefined | _Block;
    let else_branch: undefined | _Block;
    
    [error, ast, rest] = consume(rest, 'IF');
    if (error) return [error, ast, [...tokens]];

    [error, condition, rest] = atomic(rest);
    if (error) return [error, ast, [...tokens]];

    [error, ast, rest] = consume(rest, 'THEN');
    if (error) return [error, ast, [...tokens]];

    [error, then_branch, rest] = block(rest);
    if (error) return [error, ast, [...tokens]];

    [error, ast, rest] = consume(rest, 'ELSE');
    if (error) return [error, ast, [...tokens]];

    [error, else_branch, rest] = block(rest);
    if (error) return [error, ast, [...tokens]];

    const result: _IfThenElse = { token: first.at, tag: '_IfThenElse', condition: (condition as _Atomic), then_branch: (then_branch as _Block), else_branch: (else_branch as _Block) };
    return [undefined, result, rest];
}

function binding(tokens: readonly Token[]): [(undefined | ParseError), (undefined | _Binding), Token[]] {
    const [first, ...rest] = tokens;

    if (is_token(first, 'IDENTIFIER')) {
        return [undefined, {token: first.at, tag: "_Binding", name: (first as TokenIdentifier).value}, rest];
    }
    else {
        return [{
            tag: 'ParseError',
            token: first.at,
            message: `Expected an identifier. Got '${first.value}' of type '${first.lexeme}' instead.`,
        }, undefined, [...tokens]];
    }
}

function identifier(tokens: readonly Token[]): [(undefined | ParseError), (undefined | _Identifier), Token[]] {
    const [first, ...rest] = tokens;

    if (is_token(first, 'IDENTIFIER')) {
        return [undefined, {token: first.at, tag: "_Identifier", name: (first as TokenIdentifier).value}, rest];
    }
    else {
        return [{
            tag: 'ParseError',
            token: first.at,
            message: `Expected an identifier. Got '${first.value}' of type '${first.lexeme}' instead.`,
        }, undefined, [...tokens]];
    }
}
