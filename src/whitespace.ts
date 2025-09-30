// Copyright (c) 2025 Marco Nikander

import { is_token_open, Token, TokenWhitespace, TokenOpen, TokenClose, is_token_close, is_token_whitespace } from "./lexer";

export function add_whitespace_to_parentheses(tokens: readonly Token[]): Token[] {
    let output: Token[] = [];
    let new_i: number = 0;
    for (let i = 0; i < tokens.length; i++) {
        const tk = tokens[i];
        if (is_token_open(tk)) {
            output.push(make_open(new_i, tk.offset));
            new_i++;
            output.push(make_whitespace(new_i, tk.offset));
            new_i++;
        }
        else if(is_token_close(tk)) {
            output.push(make_whitespace(new_i, tk.offset));
            new_i++;
            output.push(make_close(new_i, tk.offset));
            new_i++;
        }
        else {
            let temp = tk;
            temp.id = new_i;
            new_i++;
            output.push(temp);
        }
    }
    return output;
}

export function check_whitespace(tokens: readonly Token[]): boolean {
    let expect_whitespace: boolean = false;

    for (let i = 0; i < tokens.length; i++) {
        const tk = tokens[i];
        
        if (expect_whitespace) {
            if (is_token_whitespace(tk)) {
                expect_whitespace = false; // we got what we were looking for -> all good
            }
            else {
                throw Error(`Expected whitespace between tokens '${tokens[i-1].value}' and '${tokens[i].value}'.`);
            }
        }
        else if (!is_token_whitespace(tk)) {
            expect_whitespace = true;
        }
    }
    return true;
}

export function remove_whitespace(tokens: readonly Token[]): Token[] {
    let output: Token[] = [];

    let new_i: number = 0;
    for (let i = 0; i < tokens.length; i++) {
        const tk = tokens[i];
        if (!is_token_whitespace(tk)) {
            let temp = tk;
            temp.id = new_i;
            output.push(temp);
            new_i++;
        }
    }

    return output;
}

function make_whitespace(token_number: number, character_offset: number): TokenWhitespace {
    return { tag: 'Token', lexeme: 'WHITESPACE', id: token_number, offset: character_offset, value: ' ' };
}

function make_open(token_number: number, character_offset: number): TokenOpen {
    return { tag: 'Token', lexeme: 'OPEN', id: token_number, offset: character_offset, value: '(' };
}

function make_close(token_number: number, character_offset: number): TokenClose {
    return { tag: 'Token', lexeme: 'CLOSE', id: token_number, offset: character_offset, value: ')' };
}
