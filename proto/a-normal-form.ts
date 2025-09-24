// Copyright (c) 2025 Marco Nikander

export type _Node       = _Boolean | _Number | _String | _Identifier | _Binding | _Reference | _Lambda | _Let | _If | _Call | _Plus | _StartBlock | _EndBlock;
export type _Boolean    = { id: number, tag: "Boolean", value: boolean };
export type _Number     = { id: number, tag: "Number", value: number };
export type _String     = { id: number, tag: "String", value: string };
export type _Identifier = { id: number, tag: "Identifier", name: string };
export type _Binding    = { id: number, tag: "Binding", name: string };
export type _Reference  = { id: number, tag: "Reference", target: number };
export type _Lambda     = { id: number, tag: "Lambda" , binding: number, body: number };
export type _Let        = { id: number, tag: "Let" , binding: number, value: number, body: number };
export type _If         = { id: number, tag: "If" , condition: number, then: number, else: number };
export type _Call       = { id: number, tag: "Call" , callable: number, argument: number };
export type _Plus       = { id: number, tag: "+", left: number, right: number}
export type _StartBlock = { id: number, tag: "StartBlock" };
export type _EndBlock   = { id: number, tag: "EndBlock" };

type State  = { t: number, input: string, output: _Node[]};
type Token  = { tag: "Token", lexeme: Lexeme, word: string }
type Lexeme = "SPACE" | "OPEN" | "CLOSE" | "BOOL" | "INT" | "FLOAT" | "STRING" | "ALPHANUMERIC" |  "OPERATION" ;
const lexemes: Record<Lexeme, RegExp> = {
    "SPACE":        /^\s+/,
    "OPEN":         /^\(/,
    "CLOSE":        /^\)/,
    "BOOL":         /^(true|false)/,
    "INT":          /^[-+]?[0-9]+/,
    "FLOAT":        /^[-+]?((\d+\.\d*)|(\d*\.\d+))/,
    "STRING":       /^"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/,
    "ALPHANUMERIC": /^[_a-zA-Z][_a-zA-Z0-9]*/,
    "OPERATION":    /^[.,:;!?<>\=\@\#\$\+\-\*\/\%\&\|\^\~]+/,
};


export function parse(input: string): _Node[] {
    let state: State = { t: 0, input: input, output: []};
    return expr(state).output;
}

export function expr(state: State): State {
    if (!is_at_end(state)) { //  -- should I do this recursively or iteratively?

        const token = check(state, "BOOL") 
                   ?? check(state, "FLOAT")
                   ?? check(state, "INT")
                   ?? check(state, "STRING")
                   ?? check(state, "ALPHANUMERIC")
                   ?? check(state, "OPERATION")
                   ?? check(state, "OPEN")
                   ?? check(state, "CLOSE");
        if (token) {
            state = consume(state, token.word);
            
            if (token.lexeme === "BOOL") {
                state = push(state, make_boolean(get_id(state), token.word));
            }
            else if (token.lexeme === "INT" || token.lexeme === "FLOAT") {
                state = push(state, make_number(get_id(state), token.word));
            }
            else if (token.lexeme === "STRING" ) {
                state = push(state, make_string(get_id(state), token.word));
            }
            else if (token.lexeme === "ALPHANUMERIC" || token.lexeme === "OPERATION") {
                state = push(state, make_identifier(get_id(state), token.word));
            }
            else if (token.lexeme === "OPEN") {

                // TODO: we may need to expand the term to several lines here!!!

                const current: string = state.input.slice(state.t);
                if (current.startsWith("lambda")) {
                    state = consume(state, "lambda");
                    // TODO: lambda
                    throw Error(`Lambda: Cannot parse '${token.word}'. Not implemented yet.`);
                }
                else if (current.startsWith("let")) {
                    // TODO: let expression
                    throw Error(`Let: Cannot parse '${token.word}'. Not implemented yet.`);
                }
                else if (current.startsWith("if")) {
                    state = push(state, {id: get_id(state), tag: "StartBlock"});
                    state = expect(state, "CLOSE");

                    state = push(state, {id: get_id(state), tag: "EndBlock"});
                }
                else { // function call
                    // TODO: how do I figure out if I have to expand or not?
                    // TODO: if I have to expand, how do I do that?
                    state = expr(state);
                    
                    while (!is_at_end(state) && check(state, "SPACE")) {
                        state = expect(state, "SPACE");
                        state = expr(state);
                    }
                    state = expect(state, "CLOSE");
                }
            }
            else {
                // TODO more cases
                throw Error(`Cannot parse '${token.word}'. Not implemented yet.`);
            }
        }
        else {
            throw Error(`Expected expression, got '${peek(state)}' at position ${state.t}`);
        }
    }
    else {
        throw(`Expected expression, reached end-of-line instead.`);
    }
    return state;
}

function push(state: State, node: _Node): State {
    state.output.push(node);
    return state;
}

function expect(state: State, lexeme: Lexeme): State {
    const token = check(state, lexeme);
    if (token) {
        state = consume(state, token.word);
        return state;
    }
    else {
        throw Error(`Reached end of input, ${lexeme} expected`);
    }
}

function check(state: State, expected: Lexeme): undefined | Token {
    if (is_at_end(state)) {
        return undefined;
    }
    else {
        const remaining: string = state.input.slice(state.t);
        const match = lexemes[expected].exec(remaining)
        if (match) {
            const word = match[0];
            return { tag: "Token", lexeme: expected, word: word };
        }
        else {
            return undefined;
        }
    }
}

function consume(state: State, word: string): State {
    state.t += word.length;
    return state;
}

function get_id(state: State): number {
    return state.output.length;
}

function is_at_end(state: State): boolean {
    return state.t >= state.input.length;
}

function peek(state: State): string {
    return state.input[state.t];
}

function make_boolean (id: number, word: string): _Boolean {
    if (word === "false" || word === "False") {
        return { id: id, tag: "Boolean", value: false };
    }
    else if (word === "true" || word === "True") {
        return { id: id, tag: "Boolean", value: true };
    }
    else {
        throw Error(`Expected boolean token to be either true or false but got '${word}'`);
    }
}

function make_number(id: number, word: string): _Number {
    return { id: id, tag: "Number", value: Number(word) };
}

function make_string(id: number, word: string): _String {
    return { id: id, tag: "String", value: word };
}

function make_identifier (id: number, word: string): _Identifier {
    return { id: id, tag: "Identifier", name: word };
}
