import { describe, it, expect } from 'vitest'
import { to_token, tokenize, Token} from '../deprecated/lexer'
import { is_error } from '../deprecated/error';

describe('to_token', () => {

    it('must convert an integer into a number token', () => {
        expect(to_token('-1')).toStrictEqual({kind: "TokenNumber", value: -1});
        expect(to_token('0')).toStrictEqual({kind: "TokenNumber", value: 0});
        expect(to_token('1')).toStrictEqual({kind: "TokenNumber", value: 1});
        expect(to_token('+1')).toStrictEqual({kind: "TokenNumber", value: 1});
    });

    it('must convert a boolean into a boolean token', () => {
        expect(to_token('True')).toStrictEqual({kind: "TokenBoolean", value: true});
        expect(to_token('False')).toStrictEqual({kind: "TokenBoolean", value: false})
    });

    it('convert an opening parenthesis into an opening parenthesis token', () => {
        expect(to_token('(')).toStrictEqual({kind: "TokenOpenParen", value: "("});
    });

    it('convert a closing parenthesis into a closing parenthesis token', () => {
        const expected: Token = {kind: "TokenCloseParen", value: ")"};
        expect(to_token(')')).toStrictEqual(expected);
    });

    it("must convert '+' into an identifier token", () => {
        const expected: Token = {kind: "TokenIdentifier", value: "+"};
        expect(to_token('+')).toStrictEqual(expected);
    });

    it('must convert a variable name, which starts with a letter or underscore and does not contain other special characters, into an identifier token', () => {
        expect(to_token('x').kind).toStrictEqual("TokenIdentifier");
    });

    it('must convert a sequence of special charaters into an identifier token', () => {
        expect(to_token('???').kind).toStrictEqual("TokenIdentifier");
    });

    it('invalid identifiers', () => {
        expect(to_token('$a').kind).toStrictEqual("Lexing error");
        expect(to_token('a$').kind).toStrictEqual("Lexing error");
        expect(to_token('$1').kind).toStrictEqual("Lexing error");
        expect(to_token('1$').kind).toStrictEqual("Lexing error");
        expect(to_token('1a').kind).toStrictEqual("Lexing error");
        expect(to_token('1_').kind).toStrictEqual("Lexing error");
        expect(to_token('_+').kind).toStrictEqual("Lexing error");
    });
});

describe('tokenize', () => {

    it('must tokenize zero', () => {
        const expected: Token[] = [{kind: "TokenNumber", value: 0}];
        expect(tokenize('0')).toStrictEqual(expected);
    });

    it('must tokenize positive one', () => {
        const expected: Token[] = [{kind: "TokenNumber", value: +1}];
        expect(tokenize('+1')).toStrictEqual(expected);
    });

    it('must tokenize negative one', () => {
      const expected: Token[] = [{kind: "TokenNumber", value: -1}];
      expect(tokenize('-1')).toStrictEqual(expected);
  });

    it('must tokenize one plus two', () => {
        const expected: Token[] = [{kind: "TokenOpenParen", value: "("},
                                   {kind: "TokenIdentifier", value: "+"},
                                   {kind: "TokenNumber", value: 1},
                                   {kind: "TokenNumber", value: 2},
                                   {kind: "TokenCloseParen", value: ")"},
                                  ];
        expect(tokenize('(+ 1 2)')).toStrictEqual(expected);
    });

    it('must report an error on invalid parentheses', () => {
        const result = tokenize('(');
        expect(Array.isArray(result)).toBe(false);
        expect(is_error(result)).toStrictEqual(true);
    });

});
