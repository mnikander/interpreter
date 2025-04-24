import { describe, it, expect } from 'vitest'
import { to_token, tokenize, Token} from '../src/lexer'
import { Error, is_error } from '../src/error';

describe('to_token', () => {

    it('zero', () => {
        const expected: Token = {kind: "TokenNumber", value: 0};
        expect(to_token('0')).toStrictEqual(expected);
    });

    it('True', () => {
        const expected: Token = {kind: "TokenBoolean", value: true};
        expect(to_token('True')).toStrictEqual(expected);
    });

    it('False', () => {
        const expected: Token = {kind: "TokenBoolean", value: false};
        expect(to_token('False')).toStrictEqual(expected);
    });

    it('left', () => {
        const expected: Token = {kind: "TokenOpenParen", value: "("};
        expect(to_token('(')).toStrictEqual(expected);
    });

    it('right', () => {
        const expected: Token = {kind: "TokenCloseParen", value: ")"};
        expect(to_token(')')).toStrictEqual(expected);
    });

    it('add', () => {
        const expected: Token = {kind: "TokenIdentifier", value: "+"};
        expect(to_token('+')).toStrictEqual(expected);
    });

    it('custom function', () => {
        expect(to_token('my_function').kind).toStrictEqual("TokenIdentifier");
    });

    it('custom operation', () => {
        expect(to_token('???').kind).toStrictEqual("TokenIdentifier");
    });

    it('invalid identifiers', () => {
        expect(to_token('$a').kind).toStrictEqual("Lexing Error");
        expect(to_token('a$').kind).toStrictEqual("Lexing Error");
        expect(to_token('$1').kind).toStrictEqual("Lexing Error");
        expect(to_token('1$').kind).toStrictEqual("Lexing Error");
        expect(to_token('1a').kind).toStrictEqual("Lexing Error");
        expect(to_token('1_').kind).toStrictEqual("Lexing Error");
        expect(to_token('_+').kind).toStrictEqual("Lexing Error");
    });
});

describe('tokenize', () => {

    it('zero', () => {
        const expected: Token[] = [{kind: "TokenNumber", value: 0}];
        expect(tokenize('0')).toStrictEqual(expected);
    });

    it('positive one', () => {
        const expected: Token[] = [{kind: "TokenNumber", value: +1}];
        expect(tokenize('+1')).toStrictEqual(expected);
    });

    it('negative one', () => {
      const expected: Token[] = [{kind: "TokenNumber", value: -1}];
      expect(tokenize('-1')).toStrictEqual(expected);
  });

    it('one plus two', () => {
        const expected: Token[] = [{kind: "TokenOpenParen", value: "("},
                                   {kind: "TokenIdentifier", value: "+"},
                                   {kind: "TokenNumber", value: 1},
                                   {kind: "TokenNumber", value: 2},
                                   {kind: "TokenCloseParen", value: ")"},
                                  ];
        expect(tokenize('(+ 1 2)')).toStrictEqual(expected);
    });

    it('invalid parentheses', () => {
        const result = tokenize('(');
        expect(Array.isArray(result)).toBe(false);
        expect(is_error(result)).toStrictEqual(true);
    });

});
