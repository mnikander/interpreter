import { describe, it, expect } from 'vitest'
import { lex } from '../src/lexer'
import { Nested_Boolean, Nested_Call, Nested_Expression, Nested_Identifier, Nested_Lambda, Nested_Number, Nested_String, parse } from '../src/parser_oo';

describe('parse atoms', () => {

    it('must parse "true" to a boolean', () => {
        const text: string = 'true';
        const parsed = parse(lex(text));
        expect(parsed.ast.kind).toBe("Nested_Boolean");
        expect((parsed.ast as Nested_Boolean).value).toBe(true);
    });

    it('must parse "-0.1" to a number', () => {
        const text: string = '-0.1';
        const parsed = parse(lex(text));
        expect(parsed.ast.kind).toBe("Nested_Number");
        expect((parsed.ast as Nested_Number).value).toEqual(-0.1);
    });

    it('must parse "hello world" to a string', () => {
        const text: string = '"hello world"';
        const parsed = parse(lex(text));
        expect(parsed.ast.kind).toBe("Nested_String");
        expect((parsed.ast as Nested_String).value).toEqual('\"hello world\"');
    });

    it("must parse 'hello world' to a string", () => {
        const text: string = "'hello world'";
        const parsed = parse(lex(text));
        expect(parsed.ast.kind).toBe("Nested_String");
        expect((parsed.ast as Nested_String).value).toEqual('\'hello world\'');
    });

    it('must parse "+" to an identifier', () => {
        const text: string = "+";
        const parsed = parse(lex(text));
        expect(parsed.ast.kind).toBe("Nested_Identifier");
        expect((parsed.ast as Nested_Identifier).name).toEqual("+");
    });
});

describe('valid and invalid parentheses', () => {

    it('must report an error for "("', () => {
        expect(() => parse(lex("("))).toThrow();
    });

    it('must report an error for ")"', () => {
        expect(() => parse(lex(")"))).toThrow();
    });

    it('must report an error for ")("', () => {
        expect(() => parse(lex(")("))).toThrow();
    });

    it('must report an error for "(("', () => {
        expect(() => parse(lex("(("))).toThrow();
    });

    it('must report an error for "))"', () => {
        expect(() => parse(lex("))"))).toThrow();
    });

    it('must report an error for "()"', () => {
        // this check could also be done during semantic analysis, but failing fast is probably good
        expect(() => parse(lex(")("))).toThrow();
    });
});

describe('expressions', () => {

    it('must report an error for empty expressions', () => {
        const text: string = '';
        expect(() => parse(lex(text))).toThrow();
    });

    it('must report an error for empty function calls', () => {
        // TODO: this could be delayed to the semantic analysis
        const text: string = '()';
        expect(() => parse(lex(text))).toThrow();
    });

    it('must report an error if the input consists of more than one expression', () => {
        const text: string = 'true false';
        expect(() => parse(lex(text))).toThrow();
    });

    it('must report an error when spaces beween identifiers are missing', () => {
        const text = '(+a b)';
        expect(() => parse(lex(text))).toThrow();
    });

    it('must report an error for invalid identifiers, either during lexing or parsing', () => {
        expect(() => parse((lex('$a')))).toThrow();
        expect(() => parse((lex('a$')))).toThrow();
        expect(() => parse((lex('$1')))).toThrow();
        expect(() => parse((lex('1$')))).toThrow();
        expect(() => parse((lex('1a')))).toThrow();
        expect(() => parse((lex('1_')))).toThrow();
        expect(() => parse((lex('_+')))).toThrow();
    });

    it('must produce a valid AST for an arithmetic expression', () => {
        const parsed = parse(lex("((+ 1) 2)"));
        const ast: Nested_Expression = parsed.ast;
        const node_count: number     = parsed.node_count;
        expect(node_count).toBe(5);
        expect(ast.kind).toBe("Nested_Call");
    });

    it('must produce a valid AST for a simple lambda expression', () => {
        const parsed = parse(lex("((lambda x x) 42)"));
        const ast: Nested_Expression = parsed.ast;
        const node_count: number     = parsed.node_count;
        expect(node_count).toBe(5);
        expect(ast.kind).toBe("Nested_Call");
        expect((ast as Nested_Call).id).toBe(0);
        expect((ast as Nested_Call).fn.id).toBe(1);
        expect((ast as Nested_Call).arg.id).toBe(4);
        expect(((ast as Nested_Call).arg as Nested_Number).value).toBe(42);
        expect((((ast as Nested_Call).fn) as Nested_Lambda).binding.id).toBe(2);
        expect((((ast as Nested_Call).fn) as Nested_Lambda).binding.kind).toBe("Nested_Binding");
        expect((((ast as Nested_Call).fn) as Nested_Lambda).binding.name).toBe("x");
        expect((((ast as Nested_Call).fn) as Nested_Lambda).body.id).toBe(3);
        expect((((ast as Nested_Call).fn) as Nested_Lambda).body.kind).toBe("Nested_Identifier");
        expect(((((ast as Nested_Call).fn) as Nested_Lambda).body as Nested_Identifier).name).toBe("x");
    });

    it('must produce a valid AST for a nested lambda expression', () => {
        const parsed = parse(lex("(((lambda a (lambda b a)) 1) 2)"));
        const ast: Nested_Expression = parsed.ast;
        const node_count: number     = parsed.node_count;
        expect(node_count).toBe(9);
        expect(ast.kind).toBe("Nested_Call");
        expect((ast as Nested_Call).id).toBe(0);
        expect((ast as Nested_Call).fn.id).toBe(1);
        expect((ast as Nested_Call).arg.id).toBe(8);
    });
});
