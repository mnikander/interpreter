import { describe, it, expect } from 'vitest'
import { lex } from '../src/lexer'
import { _Boolean, _Call, _Expression, _Identifier, _Lambda, _Number, _String, parse } from '../src/parser';

describe('parse atoms', () => {

    it('must parse "true" to a boolean', () => {
        const text: string = 'true';
        const parsed = parse(lex(text));
        expect(parsed.ast.tag).toBe("_Boolean");
        expect((parsed.ast as _Boolean).value).toBe(true);
    });

    it('must parse "-0.1" to a number', () => {
        const text: string = '-0.1';
        const parsed = parse(lex(text));
        expect(parsed.ast.tag).toBe("_Number");
        expect((parsed.ast as _Number).value).toEqual(-0.1);
    });

    it('must parse "hello world" to a string', () => {
        const text: string = '"hello world"';
        const parsed = parse(lex(text));
        expect(parsed.ast.tag).toBe("_String");
        expect((parsed.ast as _String).value).toEqual('\"hello world\"');
    });

    it("must parse 'hello world' to a string", () => {
        const text: string = "'hello world'";
        const parsed = parse(lex(text));
        expect(parsed.ast.tag).toBe("_String");
        expect((parsed.ast as _String).value).toEqual('\'hello world\'');
    });

    it('must parse "+" to an identifier', () => {
        const text: string = "+";
        const parsed = parse(lex(text));
        expect(parsed.ast.tag).toBe("_Identifier");
        expect((parsed.ast as _Identifier).name).toEqual("+");
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
        const ast: _Expression = parsed.ast;
        const node_count: number     = parsed.node_count;
        expect(node_count).toBe(5);
        expect(ast.tag).toBe("_Call");
    });

    it('must produce a valid AST for a simple lambda expression', () => {
        const parsed = parse(lex("((lambda x x) 42)"));
        const ast: _Expression = parsed.ast;
        const node_count: number     = parsed.node_count;
        expect(node_count).toBe(5);
        expect(ast.tag).toBe("_Call");
        expect((ast as _Call).id).toBe(0);
        expect((ast as _Call).fn.id).toBe(1);
        expect((ast as _Call).arg.id).toBe(4);
        expect(((ast as _Call).arg as _Number).value).toBe(42);
        expect((((ast as _Call).fn) as _Lambda).binding.id).toBe(2);
        expect((((ast as _Call).fn) as _Lambda).binding.tag).toBe("_Binding");
        expect((((ast as _Call).fn) as _Lambda).binding.name).toBe("x");
        expect((((ast as _Call).fn) as _Lambda).body.id).toBe(3);
        expect((((ast as _Call).fn) as _Lambda).body.tag).toBe("_Identifier");
        expect(((((ast as _Call).fn) as _Lambda).body as _Identifier).name).toBe("x");
    });

    it('must produce a valid AST for a nested lambda expression', () => {
        const parsed = parse(lex("(((lambda a (lambda b a)) 1) 2)"));
        const ast: _Expression = parsed.ast;
        const node_count: number     = parsed.node_count;
        expect(node_count).toBe(9);
        expect(ast.tag).toBe("_Call");
        expect((ast as _Call).id).toBe(0);
        expect((ast as _Call).fn.id).toBe(1);
        expect((ast as _Call).arg.id).toBe(8);
    });
});
