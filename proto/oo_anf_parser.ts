// Copyright (c) 2025 Marco Nikander

import { Item } from "../src/item";
import { Lexeme, Token, TokenBoolean, TokenIdentifier, TokenNumber, TokenString, is_token } from "../src/lexer";
import { remove_whitespace } from "../src/whitespace";

export type _Expr       = _LetBind | _Tail;
export type _Literal    = _Boolean | _Number | _String;
export type _Tail       = _Atomic  | _Call   | _Complex;
export type _Atomic     = _Literal | _Binding | _Identifier | _Lambda | _Block; 
export type _Complex    = _IfThenElse;
export type _Block      = {id: number, tk: number, tag: '_Block', let_bindings: _LetBind[], tail: _Tail};
export type _LetBind    = {id: number, tk: number, tag: '_LetBind', binding: _Binding, value: (_Atomic | _Call)};
export type _Lambda     = {id: number, tk: number, tag: '_Lambda', binding: _Binding, body: _Block};
export type _Call       = {id: number, tk: number, tag: '_Call', fn: _Atomic, arg: _Atomic};
export type _IfThenElse = {id: number, tk: number, tag: '_IfThenElse', condition: _Atomic | _Call, then_branch: _Block, else_branch: _Block};
export type _Binding    = {id: number, tk: number, tag: '_Binding', name: string};
export type _Identifier = {id: number, tk: number, tag: '_Identifier', name: string};
export type _Boolean    = {id: number, tk: number, tag: '_Boolean', value: boolean};
export type _Number     = {id: number, tk: number, tag: '_Number', value: number};
export type _String     = {id: number, tk: number, tag: '_String', value: string};

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


export function parse(tokens: readonly Token[]): _Block {
    const filtered_tokens: Token[] = remove_whitespace(tokens);
    let parser: ANF_Parser         = new ANF_Parser(filtered_tokens);
    const ast: _Block              = parser.block();
    
    if (!parser.at_end()) {
        throw Error(`Expected input to be one program. A second program begins at token '${parser.peek().value}' of type '${parser.peek().lexeme}'.`);
    }

    return ast;
}

export class ANF_Parser {
    index: number;
    node_count: number;
    readonly tokens: readonly Token[];

    constructor(tokens: readonly Token[]) {
        this.index      = 0;
        this.node_count = 0;
        this.tokens     = tokens;
    }
    
    // check if we have reached the end of the input
    at_end(): boolean {
        return is_token(this.peek(), 'EOF');
    }
    
    // look at the current token
    peek(): Token {
        if (0 <= this.index && this.index >= this.tokens.length) {
            throw Error(`Current token is out of bounds.`);
        }
        else {
            return this.tokens[this.index];
        }
    }
    
    // look at the previous token
    previous(): Token {
        if (0 <= this.index-1 && this.index-1 >= this.tokens.length) {
            throw Error(`Previous token is out of bounds.`);
        }
        else {
            return this.tokens[this.index-1];
        }
    }
    
    // move on to the next token
    advance() {
        this.index++;
    }
    
    // check type of current token against an expectation
    check(lexeme: Lexeme): undefined | Lexeme {
        if (is_token(this.peek(), lexeme)) {
            return lexeme;
        }
        else {
            return undefined;
        }
    }

    // check the current token against an array of possibilities
    check_any(lexemes: Lexeme[]): undefined | Lexeme {
        let result: undefined | Lexeme = undefined;
        for (let i: number = 0; i<lexemes.length; i++) {
            result = result ?? this.check(lexemes[i]); 
        }
        return result;
    }

    // check type of current token against an expectation, advance if it's a match
    match(lexeme: Lexeme): undefined | Lexeme {
        if (is_token(this.peek(), lexeme)) {
            this.advance();
            return lexeme;
        }
        else {
            return undefined;
        }
    }

    // creates an 'Error' for mismatched tokens, which helps with consistent formatting and reduction of boiler-plate
    report_expected(lexemes: Lexeme[]): Error {
        const expected: string = lexemes.reduce((acc: string, b: Lexeme) => `${acc}'${b}', `, "");
        return Error(`Expected '${expected}' got '${this.peek().value}' of type '${this.peek().lexeme}'.`);
    }

    // BLOCK          = open LET_STAR TAIL close
    block(): _Block {
        const id = this.node_count++;
        const tk = this.index;

        if (!this.match('OPEN')) {
            throw this.report_expected(['OPEN']);
        }

        const lets: _LetBind[] = this.let_star();
        const tail: _Tail      = this.tail();

        if (!this.match('CLOSE')) {
            throw this.report_expected(['CLOSE']);
        }

        const node: _Block = {
            id: id,
            tk: tk,
            tag: '_Block',
            let_bindings: lets,
            tail: tail
        };
        return node;
    }

    // LET_STAR       = *('let' BINDING '=' ATOMIC_OR_CALL 'in')
    let_star(): _LetBind[] {
        let bindings: _LetBind[] = [];

        while (is_token(this.peek(), 'LET')) {
            const id = this.node_count++;
            const tk = this.index;

            if (!this.match('LET')) {
                throw this.report_expected(['LET']);
            }

            const left = this.binding();

            if (!this.match('ASSIGN')) {
                throw this.report_expected(['ASSIGN']);
            }

            const right: _Atomic | _Call = this.atomic_or_call();

            if (!this.match('IN')) {
                throw this.report_expected(['IN']);
            }

            const node: _LetBind = {
                id: id,
                tk: tk,
                tag: '_LetBind',
                binding: left,
                value: right
            };
            bindings.push(node);
        }
        return bindings;
    }

    // LAMBDA         = 'lambda' BINDING BLOCK
    lambda(): _Lambda {
        const id = this.node_count++;
        const tk = this.index;

        if (!this.match('LAMBDA')) {
            throw this.report_expected(['LAMBDA']);
        }

        const binding = this.binding();
        const block   = this.block();

        const node: _Lambda = {
            id: id,
            tk: tk,
            tag: '_Lambda',
            binding: binding,
            body: block
        };
        return node;
    }

    // IF             = 'if' ATOMIC_OR_CALL 'then' BLOCK 'else' BLOCK
    if_then_else(): _IfThenElse {
        const id = this.node_count++;
        const tk = this.index;
        
        if (!this.match('IF')) {
            throw this.report_expected(['IF']);
        }

        const condition: _Atomic | _Call = this.atomic_or_call();

        if (!this.match('THEN')) {
            throw this.report_expected(['THEN']);
        }

        const then_branch: _Block = this.block();
        
        if (!this.match('ELSE')) {
            throw this.report_expected(['ELSE']);
        }

        const else_branch: _Block = this.block();

        const node: _IfThenElse = {
            id: id,
            tk: tk,
            tag: '_IfThenElse',
            condition: condition,
            then_branch: then_branch,
            else_branch: else_branch
        };
        return node;
    }

    // TAIL           = ATOMIC_OR_CALL | COMPLEX
    tail(): _Tail {
        if(this.is_token_atomic()) 
        {
            return this.atomic_or_call();
        }
        else if (this.is_token_complex()) {
            return this.complex();
        }
        else {
            throw this.report_expected(['BOOLEAN', 'NUMBER', 'STRING', 'IDENTIFIER', 'LAMBDA', 'OPEN', 'IF']);
        }
    }

    // ATOMIC_OR_CALL = ATOMIC [ATOMIC]
    atomic_or_call(): _Atomic | _Call {
        const id = this.node_count++;
        const tk = this.index;

        const first_atom = this.atomic();

        if(this.is_token_atomic()) {
            const second_atom = this.atomic();
            const call: _Call = {
                id: id,
                tk: tk,
                tag: '_Call',
                fn: first_atom,
                arg: second_atom
            };
            return call;
        }
        else {
            return first_atom;
        }
    }
    
    // ATOMIC         = LITERAL | REFERENCE | LAMBDA | BLOCK
    atomic(): _Atomic {
        const tok: Token = this.peek();
        if(this.is_token_literal()) {
            return this.literal();
        }
        else if (is_token(tok, 'IDENTIFIER')) {
            return this.identifier();
        }
        else if (is_token(tok, 'LAMBDA')) {
            return this.lambda();
        }
        else if (is_token(tok, 'OPEN')) {
            return this.block();
        }
        else {
            throw this.report_expected(['BOOLEAN', 'NUMBER', 'STRING', 'IDENTIFIER', 'LAMBDA', 'OPEN']);
        }
    }
    
    // provide a predicate, since this is a union type, which just forwards to other functions
    is_token_atomic(): undefined | Lexeme {
        return this.check_any(['BOOLEAN', 'NUMBER', 'STRING', 'IDENTIFIER', 'LAMBDA', 'OPEN']);
    }
    
    // COMPLEX        = IF
    complex(): _Complex {
        const tok: Token = this.peek();
        if (is_token(tok, 'IF')) {
            return this.if_then_else();
        }
        else {
            throw this.report_expected(['IF']);
        }
    }

    // provide a predicate, since this is a union type, which just forwards to other functions
    is_token_complex(): undefined | Lexeme {
        return this.check_any(['IF']);
    }
    
    // BINDING        = identifier
    binding(): _Binding {
        const id = this.node_count++;
        const tk = this.index;

        if (is_token(this.peek(), 'IDENTIFIER')) {
            const token = this.peek();
            this.advance();
            const node: _Binding = {
                id: id,
                tk: tk,
                tag: '_Binding',
                name: (token as TokenIdentifier).value
            };
            return node;
        }
        else {
            throw this.report_expected(['IDENTIFIER']);
        }
    }
    
    // IDENTIFIER     = identifier
    identifier(): _Identifier {
        const id = this.node_count++;
        const tk = this.index;

        if (is_token(this.peek(), 'IDENTIFIER')) {
            const token = this.peek();
            this.advance();
            const node: _Identifier = {
                id: id,
                tk: tk,
                tag: '_Identifier',
                name: (token as TokenIdentifier).value
            };
            return node;
        }
        else {
            throw this.report_expected(['IDENTIFIER']);
        }
    }
        
    // LITERAL        = boolean | number | string
    literal(): _Literal {
        const id = this.node_count++;
        const tk = this.index;
        
        if (this.match('BOOLEAN')) {
            return {id: id, tk: tk, tag: "_Boolean", value: (this.previous() as TokenBoolean).value};
        }
        else if (this.match('NUMBER')) {
            return {id: id, tk: tk, tag: "_Number", value: (this.previous() as TokenNumber).value};
        }
        else if (this.match('STRING')) {
            return {id: id, tk: tk, tag: "_String", value: (this.previous() as TokenString).value};
        }
        else {
            throw this.report_expected(['BOOLEAN', 'NUMBER', 'STRING']);
        }
    }

    // provide a predicate, since this is a union type which just forwards to other functions
    is_token_literal(): undefined | Lexeme {
        return this.check_any(['BOOLEAN', 'NUMBER', 'STRING']);
    }
}
