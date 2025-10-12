// Copyright (c) 2025 Marco Nikander

import { Lexeme, Token, TokenBoolean, TokenIdentifier, TokenNumber, TokenString, is_token } from "./lexer";
import { remove_whitespace } from "./whitespace";
import { _Expression, _Literal, _Tail, _Atomic, _Complex, _Block, _LetBind, _Lambda, _Call, _IfThenElse, _Binding, _Identifier, _Boolean, _Number, _String, walk } from "./ast"

const id_placeholder: number = -1;

export function parse(tokens: readonly Token[]): { ast: _Block, node_count: number } {
    const filtered_tokens: Token[] = remove_whitespace(tokens);
    let parser: ANF_Parser         = new ANF_Parser(filtered_tokens);
    let ast: _Block                = parser.block();

    let counter = {index: 0};
    const visitor = { pre: (node: _Expression, context: {index: number}) => { node.id = context.index; context.index++;} };
    walk(ast, visitor, counter);
    
    if (!parser.at_end()) {
        throw Error(`Expected input to be one program. A second program begins at token '${parser.peek().value}' of type '${parser.peek().lexeme}'.`);
    }

    return { ast: ast, node_count: counter.index };
}

export class ANF_Parser {
    index: number;
    readonly tokens: readonly Token[];

    constructor(tokens: readonly Token[]) {
        this.index      = 0;
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

    // BLOCK          = open LETBIND / TAIL close
    block(): _Block {
        const offset = this.index;

        if (!this.match('OPEN')) {
            throw this.report_expected(['OPEN']);
        }

        const body: (_LetBind | _Tail) = this.content();

        if (!this.match('CLOSE')) {
            throw this.report_expected(['CLOSE']);
        }

        const node: _Block = {
            id: id_placeholder,
            token: offset,
            tag: '_Block',
            body: body,
        };
        return node;
    }

    // LETBIND        = *('let' BINDING '=' ATOMIC_OR_CALL 'in')
    letbind(): _LetBind {
        const offset = this.index;

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

        const body: (_LetBind | _Tail) = this.content();

        const binding: _LetBind = {
            id: id_placeholder,
            token: offset,
            tag: '_LetBind',
            binding: left,
            value: right,
            body: body,
        };
        return binding;
    }

    content(): _LetBind | _Tail {
        let body: _LetBind | _Tail;
        if (is_token(this.peek(), 'LET')) {
            body = this.letbind();
        }
        else {
            body = this.tail();
        }
        return body;
    }

    // LAMBDA         = 'lambda' BINDING BLOCK
    lambda(): _Lambda {
        const offset = this.index;

        if (!this.match('LAMBDA')) {
            throw this.report_expected(['LAMBDA']);
        }

        const binding = this.binding();
        const block   = this.block();

        const node: _Lambda = {
            id: id_placeholder,
            token: offset,
            tag: '_Lambda',
            binding: binding,
            body: block
        };
        return node;
    }

    // IF             = 'if' ATOMIC_OR_CALL 'then' BLOCK 'else' BLOCK
    if_then_else(): _IfThenElse {
        const offset = this.index;
        
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
            id: id_placeholder,
            token: offset,
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
        const offset = this.index;

        const first_atom = this.atomic();

        if(this.is_token_atomic()) {
            const second_atom = this.atomic();
            const call: _Call = {
                id: id_placeholder,
                token: offset,
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
        const offset = this.index;

        if (this.match('IDENTIFIER')) {
            const node: _Binding = {
                id: id_placeholder,
                token: offset,
                tag: '_Binding',
                name: (this.previous() as TokenIdentifier).value
            };
            return node;
        }
        else {
            throw this.report_expected(['IDENTIFIER']);
        }
    }
    
    // IDENTIFIER     = identifier
    identifier(): _Identifier {
        const offset = this.index;

        if (this.match('IDENTIFIER')) {
            const node: _Identifier = {
                id: id_placeholder,
                token: offset,
                tag: '_Identifier',
                name: (this.previous() as TokenIdentifier).value
            };
            return node;
        }
        else {
            throw this.report_expected(['IDENTIFIER']);
        }
    }
        
    // LITERAL        = boolean | number | string
    literal(): _Literal {
        const offset = this.index;
        
        if (this.match('BOOLEAN')) {
            return {id: id_placeholder, token: offset, tag: "_Boolean", value: (this.previous() as TokenBoolean).value};
        }
        else if (this.match('NUMBER')) {
            return {id: id_placeholder, token: offset, tag: "_Number", value: (this.previous() as TokenNumber).value};
        }
        else if (this.match('STRING')) {
            return {id: id_placeholder, token: offset, tag: "_String", value: (this.previous() as TokenString).value};
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
