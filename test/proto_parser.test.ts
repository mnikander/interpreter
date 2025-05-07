import { describe, it, expect } from 'vitest'
import { lex } from '../proto/simple_lexer'
import { is_error, is_ok } from '../proto/error';
import { parse } from '../proto/parser';
import { is_leaf_boolean } from '../proto/ast';

describe('parse atoms', () => {

    it('must parse "true" to a boolean', () => {
        const lexing_result = lex('true');
        expect(is_ok(lexing_result)).toBe(true);
        if (is_ok(lexing_result)) {
            const parsing_result = parse(lexing_result.value);
            expect(is_ok(parsing_result)).toBe(true);
            if (is_ok(parsing_result)) {
                let ast = parsing_result.value;
                expect(is_leaf_boolean(ast)).toBe(true);
                if (is_leaf_boolean(ast)) {
                    expect(ast.kind).toBe("Leaf");
                    expect(ast.subkind).toBe("Boolean");
                    expect(ast.token_id).toBe(0);
                    expect(ast.value).toBe(true);
                }
            }
        }
    });
});

describe('valid and invalid parentheses', () => {

    it('must report an error for "("', () => {
        const lexing_result = lex("(");
        expect(is_ok(lexing_result)).toBe(true);
        if(is_ok(lexing_result)) {
            let parsing_result = parse(lexing_result.value);
            expect(is_error(parsing_result)).toBe(true);
        }
    });

    it('must report an error for ")"', () => {
        const lexing_result = lex(")");
        expect(is_ok(lexing_result)).toBe(true);
        if(is_ok(lexing_result)) {
            let parsing_result = parse(lexing_result.value);
            expect(is_error(parsing_result)).toBe(true);
        }
    });

    it('must report an error for ")("', () => {
        const lexing_result = lex(")(");
        expect(is_ok(lexing_result)).toBe(true);
        if(is_ok(lexing_result)) {
            let parsing_result = parse(lexing_result.value);
            expect(is_error(parsing_result)).toBe(true);
        }
    });

    it('must report an error for "()"', () => {
        // this check could also be done during semantic analysis, but failing fast is probably good
        const lexing_result = lex(")(");
        expect(is_ok(lexing_result)).toBe(true);
        if(is_ok(lexing_result)) {
            let parsing_result = parse(lexing_result.value);
            expect(is_error(parsing_result)).toBe(true);
        }
    });
});
