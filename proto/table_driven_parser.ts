// Copyright (c) 2025 Marco Nikander

// A table-driven LL(1) parser for the language of balanced parentheses.

// Production rules:
// # 0:     S  =  '(' S ')' S
// # 1:     S  =  epsilon

// First and Follow sets of the non-terminal S:
//
// First(S)  = { "(" , epsilon }
// Follow(S) = { ")" , EOF     }

// Parse Table
//
// +----------------+------------------------+
// | Which rule     |        Terminals       |
// | # to apply     |   '('     ')'     EOF  |
// +----------------+------------------------+
// | Non-         S |    0       1       1   |
// | Terminals      |                        |
// +----------------+------------------------+

export type Token = '(' | ')' | 'EOF';
type NonTerminal  = 'S';
type Vocabulary   = Token | NonTerminal;

export function lex(input: string): Token[] {
    let tokens: Token[] = [];
    for (let i = 0; i < input.length; i++) {
        switch (input[i]) {
            case '(':
                tokens.push('(');
                break;
            case ')':
                tokens.push(')');
                break;
            default:
                throw Error(`Unknown character '${input[i]}'`);
        }
    }
    tokens.push('EOF');
    return tokens;
}

export function parse(input: Token[]): boolean {
    let stack: Vocabulary[]         = ['EOF', 'S'];
    let top: undefined | Vocabulary = undefined;
    let first: undefined | Token    = input[0];
    let rest: (undefined | Token)[] = input.slice(1);
    let history: ('M'|number)[]     = []; // 'M' indicates a token was matched, numbers indicate which rule was applied instead
    
    while (stack.length > 0) {
        top = stack.pop();
        if (match(first, top)) {
            [first, ...rest] = rest;
            history.push('M');
        }
        else if (top === 'S') { // expand non-terminal
            switch (first) {
                case '(':
                    stack = stack.concat(production[0]());
                    history.push(0);
                    break;
                case ')':
                    stack = stack.concat(production[1]());
                    history.push(1);
                    break;
                case 'EOF':
                    stack = stack.concat(production[1]());
                    history.push(1);
                    break;
                default:
                    throw Error('Unhandled case! @(x_x)@');
                    break;
            }
        }
        else {
            return false;
        }
    }

    return stack.length == 0 && rest.length == 0;
}

const production: Array<() => Vocabulary[]> = [
    (): Vocabulary[] => ['S', ')', 'S', '('],
    (): Vocabulary[] => [],
];

function match(first: undefined | Vocabulary, top: undefined | Vocabulary): boolean {
    if (!first || !top || first !== top) {
        return false;
    }
    else {
        return true;
    }
}
