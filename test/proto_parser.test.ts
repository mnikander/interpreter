import { describe, it, expect } from 'vitest'
import { lex } from '../proto/lexer'
import { is_error, is_ok } from '../proto/error';
import { line } from '../proto/parser';
import { is_leaf_boolean } from '../proto/ast';

describe('parse atoms', () => {

    it('must parse "true" to a boolean', () => {
        const lexed = lex('true');
        expect(is_ok(lexed)).toBe(true);
        if (is_ok(lexed)) {
            const parsed = line(lexed.value);
            expect(is_ok(parsed.result)).toBe(true);
            if (is_ok(parsed.result)) {
                let ast = parsed.result.value;
                expect(ast).toBeDefined();
                if(ast !== undefined) {
                    expect(is_leaf_boolean(ast)).toBe(true);
                    if (is_leaf_boolean(ast)) {
                        expect(ast.kind).toBe("Leaf");
                        expect(ast.subkind).toBe("Boolean");
                        expect(ast.token_id).toBe(0);
                        expect(ast.value).toBe(true);
                    }
                }
            }
        }
    });
});

describe('valid and invalid parentheses', () => {

    it('must report an error for "("', () => {
        const lexed = lex("(");
        expect(is_ok(lexed)).toBe(true);
        if(is_ok(lexed)) {
            let parsed = line(lexed.value);
            expect(is_error(parsed.result)).toBe(true);
        }
    });

    it('must report an error for ")"', () => {
        const lexed = lex(")");
        expect(is_ok(lexed)).toBe(true);
        if(is_ok(lexed)) {
            let parsed = line(lexed.value);
            expect(is_error(parsed.result)).toBe(true);
        }
    });

    it('must report an error for ")("', () => {
        const lexed = lex(")(");
        expect(is_ok(lexed)).toBe(true);
        if(is_ok(lexed)) {
            let parsed = line(lexed.value);
            expect(is_error(parsed.result)).toBe(true);
        }
    });

    it('must report an error for "()"', () => {
        // this check could also be done during semantic analysis, but failing fast is probably good
        const lexed = lex(")(");
        expect(is_ok(lexed)).toBe(true);
        if(is_ok(lexed)) {
            let parsed = line(lexed.value);
            expect(is_error(parsed.result)).toBe(true);
        }
    });
});

describe('expressions', () => {
    it('must produce a valid AST for arithemetic expressions', () => {
        const lexed = lex("(+ 1 2)");
        expect(is_ok(lexed)).toBe(true);
        if(is_ok(lexed)) {
            let parsed = line(lexed.value);
            expect(is_ok(parsed.result)).toBe(true);
        }
    });
});
