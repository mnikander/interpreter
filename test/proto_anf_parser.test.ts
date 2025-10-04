import { describe, it, expect } from 'vitest'
import { lex, Token } from '../src/lexer'
import { _Call, _Binding, _Reference, _Lambda, _Boolean, _Number, _String, _Block, parse } from '../proto/anf_parser';

describe('parse blocks containing literals', () => {

    it('must parse "true" to a boolean', () => {
        const text: string = '(true)';
        const parsed = parse(lex(text));
        expect(parsed.tail.tag).toBe("_Boolean");
        expect((parsed.tail as _Boolean).value).toBe(true);
    });

    it('must parse "-0.1" to a number', () => {
        const text: string = '(-0.1)';
        const parsed = parse(lex(text));
        expect(parsed.tail.tag).toBe("_Number");
        expect((parsed.tail as _Number).value).toEqual(-0.1);
    });

    it('must parse "hello world" to a string', () => {
        const text: string = '("hello world")';
        const parsed = parse(lex(text));
        expect(parsed.tail.tag).toBe("_String");
        expect((parsed.tail as _String).value).toEqual('\"hello world\"');
    });

    it("must parse 'hello world' to a string", () => {
        const text: string = "('hello world')";
        const parsed = parse(lex(text));
        expect(parsed.tail.tag).toBe("_String");
        expect((parsed.tail as _String).value).toEqual('\'hello world\'');
    });

    it('must parse "+" to an identifier', () => {
        const text: string = "(+)";
        const parsed = parse(lex(text));
        expect(parsed.tail.tag).toBe("_Reference");
        expect((parsed.tail as _Reference).target).toEqual("+");
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

    it('must produce a valid AST for a let-binding', () => {
        const tokens = lex("(let x = 5 in x)");
        const ast    = parse(tokens);
        expect(ast.tag).toBe("_Block");
        expect(ast.let_bindings[0].tag).toBe("_LetBind");
        expect(ast.let_bindings[0].binding.tag).toBe("_Binding");
        expect(ast.let_bindings[0].value.tag).toBe("_Number");
        expect(ast.tail.tag).toBe("_Reference");
    });

    it('must produce a valid AST for a lambda expression', () => {
        const tokens = lex("(lambda x (x))");
        const ast    = parse(tokens);
        expect(ast.tag).toBe("_Block");
        expect(ast.tail.tag).toBe("_Lambda");
        expect(ast.tail.binding.tag).toBe("_Binding");
        expect(ast.tail.body.tag).toBe("_Block");
        expect(ast.tail.body.tail.tag).toBe("_Reference");
    });

    it('must produce a valid AST for an arithmetic expression', () => {
        const tokens = lex("((+ 1) 2)");
        const ast    = parse(tokens);
        expect(ast.tag).toBe("_Block");
        expect(ast.tail.tag).toBe("_Call");
        expect(ast.tail.fn.tag).toBe("_Block");
        expect(ast.tail.fn.tail.tag).toBe("_Call");
        expect(ast.tail.fn.tail.fn.tag).toBe("_Reference");
        expect(ast.tail.fn.tail.fn.target).toBe("+");
        expect(ast.tail.fn.tail.arg.tag).toBe("_Number");
        expect(ast.tail.fn.tail.arg.value).toBe(1);
        expect(ast.tail.arg.tag).toBe("_Number");
        expect(ast.tail.arg.value).toBe(2);
    });
});
