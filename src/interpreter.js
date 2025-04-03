export function interpret(expr) {
    if (!check_parentheses(expr)) {
        return "ERROR: invalid parentheses";
    }
    return "..."
}

export function check_parentheses(text) {
    let count = 0;
    let open_before_close = true;

    for (let i = 0; i < text.length; i++) {
        if (text[i] == '(') {
            count++;
        }
        else if (text[i] == ')') {
            count--;
        }
        if (count < 0) {
            open_before_close = false;
        }
    }

    let balanced = (count == 0);

    return open_before_close && balanced;
}
