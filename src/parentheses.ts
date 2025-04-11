// Copyright (c) 2025 Marco Nikander

export function check_parentheses(line: string): boolean {
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

// TODO: get rid of this function. It does make parsing easier, but it will make outputting column numbers for error messages nearly impossible
export function add_whitespace_to_parentheses(line: string): string {
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
