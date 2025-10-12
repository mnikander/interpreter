import { describe, it, expect } from 'vitest'
import { lex, Token } from '../src/lexer'
import { _Call, _Binding, _Identifier, _Lambda, _Boolean, _Number, _String, _Block } from '../proto/anf_ast';
import { parse } from '../proto/oo_anf_parser';

describe('parse blocks containing literals', () => {

    it('must parse "true" to a boolean', () => {
        const text: string = '(true)';
        const parsed = parse(lex(text));
        expect(parsed.ast.body.tag).toBe("_Boolean");
        expect((parsed.ast.body as _Boolean).value).toBe(true);
    });

    it('must parse "-0.1" to a number', () => {
        const text: string = '(-0.1)';
        const parsed = parse(lex(text));
        expect(parsed.ast.body.tag).toBe("_Number");
        expect((parsed.ast.body as _Number).value).toEqual(-0.1);
    });

    it('must parse "hello world" to a string', () => {
        const text: string = '("hello world")';
        const parsed = parse(lex(text));
        expect(parsed.ast.body.tag).toBe("_String");
        expect((parsed.ast.body as _String).value).toEqual('\"hello world\"');
    });

    it("must parse 'hello world' to a string", () => {
        const text: string = "('hello world')";
        const parsed = parse(lex(text));
        expect(parsed.ast.body.tag).toBe("_String");
        expect((parsed.ast.body as _String).value).toEqual('\'hello world\'');
    });

    it('must parse "+" to an identifier', () => {
        const text: string = "(+)";
        const parsed = parse(lex(text));
        expect(parsed.ast.body.tag).toBe("_Identifier");
        expect((parsed.ast.body as _Identifier).name).toEqual("+");
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

    it('must report an error when enclosing parentheses are missing', () => {
        const text: string = '-0.1';
        const lexed: Token[] = lex(text);
        expect(() => parse(lexed)).toThrow();
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
        const parsed = parse(tokens);
        expect(parsed.ast.tag).toBe("_Block");
        expect(parsed.ast.body.tag).toBe("_LetBind");
        expect(parsed.ast.body.binding.tag).toBe("_Binding");
        expect(parsed.ast.body.value.tag).toBe("_Number");
        expect(parsed.ast.body.body.tag).toBe("_Identifier");
    });

    it('must produce a valid AST for an arithmetic expression', () => {
        const tokens = lex("((+ 1) 2)");
        const parsed = parse(tokens);
        expect(parsed.ast.tag).toBe("_Block");
        expect(parsed.ast.body.tag).toBe("_Call");
        expect(parsed.ast.body.fn.tag).toBe("_Block");
        expect(parsed.ast.body.fn.body.tag).toBe("_Call");
        expect(parsed.ast.body.fn.body.fn.tag).toBe("_Identifier");
        expect(parsed.ast.body.fn.body.fn.name).toBe("+");
        expect(parsed.ast.body.fn.body.arg.tag).toBe("_Number");
        expect(parsed.ast.body.fn.body.arg.value).toBe(1);
        expect(parsed.ast.body.arg.tag).toBe("_Number");
        expect(parsed.ast.body.arg.value).toBe(2);
    });

    it('must produce a valid AST for a simple lambda expression', () => {
        const tokens = lex("(lambda x (x))");
        const parsed = parse(tokens);
        expect(parsed.ast.tag).toBe("_Block");
        expect(parsed.ast.body.tag).toBe("_Lambda");
        expect(parsed.ast.body.binding.tag).toBe("_Binding");
        expect(parsed.ast.body.body.tag).toBe("_Block");
        expect(parsed.ast.body.body.body.tag).toBe("_Identifier");
    });

    it('must produce a valid AST for a nested lambda expression', () => {
        const tokens = lex("(((lambda a (lambda b (a))) 1) 2)");
        const parsed = parse(tokens);
        expect(parsed.ast.tag).toBe("_Block");
        expect(parsed.ast.body.tag).toBe("_Call");
        expect(parsed.ast.body.fn.tag).toBe("_Block");
        expect(parsed.ast.body.fn.body.tag).toBe("_Call");
        expect(parsed.ast.body.fn.body.fn.tag).toBe("_Block");
        expect(parsed.ast.body.fn.body.fn.body.tag).toBe("_Lambda");
        expect(parsed.ast.body.fn.body.fn.body.binding.tag).toBe("_Binding");
        expect(parsed.ast.body.fn.body.fn.body.binding.name).toBe("a");
        expect(parsed.ast.body.fn.body.fn.body.body.tag).toBe("_Block");
        expect(parsed.ast.body.fn.body.fn.body.body.body.tag).toBe("_Lambda");
        expect(parsed.ast.body.fn.body.fn.body.body.body.binding.tag).toBe("_Binding");
        expect(parsed.ast.body.fn.body.fn.body.body.body.binding.name).toBe("b");
        expect(parsed.ast.body.fn.body.fn.body.body.body.body.tag).toBe("_Block");
        expect(parsed.ast.body.fn.body.fn.body.body.body.body.body.tag).toBe("_Identifier");
        expect(parsed.ast.body.fn.body.fn.body.body.body.body.body.name).toBe("a");
        expect(parsed.ast.body.fn.body.arg.tag).toBe("_Number");
        expect(parsed.ast.body.fn.body.arg.value).toBe(1);
        expect(parsed.ast.body.arg.tag).toBe("_Number");
        expect(parsed.ast.body.arg.value).toBe(2);
    });

    it('must produce a valid AST for a simple if expression', () => {
        const tokens = lex("(if true then (42) else (0))");
        const parsed = parse(tokens);
        expect(parsed.ast.tag).toBe("_Block");
        expect(parsed.ast.body.tag).toBe("_IfThenElse");
        expect(parsed.ast.body.condition.tag).toBe("_Boolean");
        expect(parsed.ast.body.then_branch.tag).toBe("_Block");
        expect(parsed.ast.body.then_branch.body.tag).toBe("_Number");
        expect(parsed.ast.body.then_branch.body.value).toBe(42);
        expect(parsed.ast.body.else_branch.tag).toBe("_Block");
        expect(parsed.ast.body.else_branch.body.tag).toBe("_Number");
        expect(parsed.ast.body.else_branch.body.value).toBe(0);
    });
});
