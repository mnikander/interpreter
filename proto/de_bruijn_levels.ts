// Copyright (c) 2025 Marco Nikander

export function debruijn(expr: any[], level: number = 0): any[] {
    if (expr[0] === 'lambda') {
        const parameter = expr[1];
        const body      = expr[2];
        const tail = replace_symbol_with_level(body, parameter, level);
        return ['lambda', debruijn(tail, level+1)];
    }
    else {
        return expr;
    }
}

function replace_symbol_with_level(expr: any | any[], symbol: string, level: number) {
    if (expr[0] === 'lambda') { // nested lambda
        const parameter = expr[1];
        const body      = expr[2];
        if (parameter === symbol) {
            // variable is being shadowed, don't make any further substitutions, just return the expression as it is
            return ['lambda', parameter, body];
        }
        else {
            // leave the other variable in tact, proceed down the chain to replace the current variable everywhere
            return ['lambda', parameter, replace_symbol_with_level(body, symbol, level)];
        }
    }
    else {
        if (expr === symbol) {
            return { level: level };
        }
        else {
            return expr;
        }
    }
}
