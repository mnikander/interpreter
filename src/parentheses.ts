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
            throw Error(`Unbalanced parentheses. Expected '(' before character ${i}.`);
        }
    }

    if (count != 0) {
        throw Error(`Unbalanced parentheses. Expected ${count} more ')'.`);
    }

    return true;
}
