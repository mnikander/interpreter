import { describe, it, expect } from 'vitest'
import { lex } from '../proto/lexer'
import { is_error, is_ok } from '../proto/error';
import { parse } from '../proto/parser';
import { is_leaf_boolean, is_leaf_number, is_leaf_identifier, is_node } from '../proto/ast';

describe('parse atoms', () => {

    it('must parse "true" to a boolean', () => {
        const lexed = lex('true');
        expect(is_ok(lexed)).toBe(true);
        if (is_ok(lexed)) {
            const parsed = parse(lexed.value);
            expect(is_ok(parsed)).toBe(true);
            if (is_ok(parsed)) {
                let ast = parsed.value;
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
            let parsed = parse(lexed.value);
            expect(is_error(parsed)).toBe(true);
        }
    });

    it('must report an error for ")"', () => {
        const lexed = lex(")");
        expect(is_ok(lexed)).toBe(true);
        if(is_ok(lexed)) {
            let parsed = parse(lexed.value);
            expect(is_error(parsed)).toBe(true);
        }
    });

    it('must report an error for ")("', () => {
        const lexed = lex(")(");
        expect(is_ok(lexed)).toBe(true);
        if(is_ok(lexed)) {
            let parsed = parse(lexed.value);
            expect(is_error(parsed)).toBe(true);
        }
    });

    it('must report an error for "()"', () => {
        // this check could also be done during semantic analysis, but failing fast is probably good
        const lexed = lex(")(");
        expect(is_ok(lexed)).toBe(true);
        if(is_ok(lexed)) {
            let parsed = parse(lexed.value);
            expect(is_error(parsed)).toBe(true);
        }
    });
});

describe('expressions', () => {

    it('must report an error for empty expressions', () => {
        const lexed = lex('');
        if (is_error(lexed)) {
            expect(is_error(lexed)).toBe(true);
        }
        else {
            let parsed = parse(lexed.value);
            expect(is_error(parsed)).toBe(true);
        }
    });

    it('must report an error for empty function calls', () => {
        // TODO: this could be delayed to the semantic analysis
        const lexed = lex('()');
        if (is_error(lexed)) {
            expect(is_error(lexed)).toBe(true);
        }
        else {
            let parsed = parse(lexed.value);
            expect(is_error(parsed)).toBe(true);
        }
    });

    it('must report an error if the input consists of more than one expression', () => {
        const lexed = lex('true false');
        if (is_error(lexed)) {
            expect(is_error(lexed)).toBe(true);
        }
        else {
            let parsed = parse(lexed.value);
            expect(is_error(parsed)).toBe(true);
        }
    });

    it('must report an error when spaces beween identifiers are missing', () => {
        const lexed = lex('(+a b)');
        if (is_error(lexed)) {
            expect(is_error(lexed)).toBe(true);
        }
        else {
            let parsed = parse(lexed.value);
            expect(is_error(parsed)).toBe(true);
        }
    });

    it('must produce a valid AST for arithemetic expressions', () => {
        const lexed = lex("(+ 1 2)");
        expect(is_ok(lexed)).toBe(true);
        if(is_ok(lexed)) {
            let parsed = parse(lexed.value);
            expect(is_ok(parsed)).toBe(true);
            if (is_ok(parsed)) {
                if(is_node(parsed.value)) {
                    const ast = parsed.value;
                    expect(ast.kind).toBe("Node");
                    expect(ast.subkind).toBe("Call");
                    expect(ast.data.length).toBe(3);
                    expect(is_leaf_identifier(ast.data[0])).toBe(true);
                    expect(is_leaf_number(ast.data[1])).toBe(true);
                    expect(is_leaf_number(ast.data[2])).toBe(true);
                }
            }
        }
    });
});
