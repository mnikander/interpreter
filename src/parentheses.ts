// Copyright (c) 2025 Marco Nikander

export function check_parentheses(line: string): boolean {
    let count = 0;

    for (let i = 0; i < line.length; i++) {
        if (line[i] == '(') {
            count++;
        }
        else if (line[i] == ')') {
            count--;
        }
        if (count < 0) {
            throw Error(`Unbalanced parentheses. Unexpected ')' at character ${i}. Perhaps it should not be there, or a '(' is missing before it.`);
        }
    }

    if (count != 0) {
        throw Error(`Unbalanced parentheses. Expected ${count} more ')'.`);
    }

    return true;
}
