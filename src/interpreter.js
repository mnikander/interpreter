export function interpret(line) {
    if (!check_parentheses(line)) {
        return "ERROR: invalid parentheses";
    }

    let spaced   = add_whitespace_to_parentheses(line);
    let words    = spaced.split(" ");
    words        = remove_empty_words(words);
    const tokens = words.map(tokenize);
    let first_error = tokens.find(is_error);
    if (first_error != undefined)
    {
        return `ERROR: invalid token '${first_error.symbol}'`;
    }

    // hardcode addition for now
    if (tokens[0].name == "TK_NUMBER") {
        return tokens[0].value;
    }
    else if (tokens[0] == TK_LEFT &&
        tokens[1] == TK_ADD &&
        tokens[2].name == "TK_NUMBER" &&
        tokens[3].name == "TK_NUMBER" &&
        tokens[4] == TK_RIGHT) {
        return tokens[2].value + tokens[3].value;
        }
    else {
        return "ERROR: invalid expression";
    }
}

export function check_parentheses(line) {
    let count = 0;
    let open_before_close = true;

    for (let i = 0; i < line.length; i++) {
        if (line[i] == '(') {
            count++;
        }
        else if (line[i] == ')') {
            count--;
        }
        if (count < 0) {
            open_before_close = false;
        }
    }

    let balanced = (count == 0);

    return open_before_close && balanced;
}

function add_whitespace_to_parentheses(line) {
    let output = "";
    for (let i = 0; i < line.length; i++) {
        if (line[i] == '(') {
            output += ' ( ';
        }
        else if(line[i] == ')') {
            output += ' ) ';
        }
        else {
            output += line[i];
        }
    }
    return output;
}

function remove_empty_words(words) {
    let result = [];
    for (let word of words) {
        if (word != "") {
            result.push(word);
        }
    }
    return result;
}

export function maybe_token(word, token) {
    if(word == token.symbol) {
        return token;
    }
    else {
        return undefined;
    }
}

export function maybe_number(word) {
    if (word == '' || word[0] == ' ') {
        // TODO: this block should not be necessary
        return undefined;
    }
    else {
        let number = Number(word);
        if (isNaN(number)) {
            return undefined;
        }
        else {
            return {name: "TK_NUMBER", value: number}
        }
    }
}

export function tokenize(word) {
    return maybe_token(word, TK_LEFT) ??
            maybe_token(word, TK_RIGHT) ??
            maybe_token(word, TK_ADD) ??
            maybe_number(word) ??
            {name: "ERROR", symbol: word};
}

export function is_error(token) {
    return token.name == "ERROR";
}

const TK_LEFT   = {name: "TK_LEFT",   symbol: "("};
const TK_RIGHT  = {name: "TK_RIGHT",  symbol: ")"};
const TK_ADD    = {name: "TK_ADD",    symbol: "+"};
