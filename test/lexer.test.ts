import { describe, it, expect } from 'vitest'
import { to_token, tokenize, Token, TokenLeft, TokenRight, TokenNumber, TokenIdentifier } from '../src/lexer.js'

describe('to_token', () => {

    it('zero', () => {
        const expected: Token = {kind: "TK_NUMBER", value: 0} as TokenNumber;
        expect(to_token('0')).toStrictEqual(expected);
    });

    it('left', () => {
        const expected: Token = {kind: "TK_LEFT"} as TokenLeft;
        expect(to_token('(')).toStrictEqual(expected);
    });

    it('right', () => {
        const expected: Token = {kind: "TK_RIGHT"} as TokenRight;
        expect(to_token(')')).toStrictEqual(expected);
    });

    it('add', () => {
        const expected: Token = {kind: "TK_IDENTIFIER", value: "+"} as TokenIdentifier;
        expect(to_token('+')).toStrictEqual(expected);
    });

    it('custom function', () => {
        expect(to_token('my_function').kind).toStrictEqual("TK_IDENTIFIER");
    });

    it('custom operation', () => {
        expect(to_token('???').kind).toStrictEqual("TK_IDENTIFIER");
    });

    it('invalid identifiers', () => {
        expect(to_token('$a').kind).toStrictEqual("TK_ERROR");
        expect(to_token('a$').kind).toStrictEqual("TK_ERROR");
        expect(to_token('$1').kind).toStrictEqual("TK_ERROR");
        expect(to_token('1$').kind).toStrictEqual("TK_ERROR");
        expect(to_token('1a').kind).toStrictEqual("TK_ERROR");
        expect(to_token('1_').kind).toStrictEqual("TK_ERROR");
        expect(to_token('_+').kind).toStrictEqual("TK_ERROR");
    });
});

describe('tokenize', () => {

    it('zero', () => {
        const expected: Token[] = [{kind: "TK_NUMBER", value: 0} as TokenNumber];
        expect(tokenize('0')).toStrictEqual(expected);
    });

    it('positive one', () => {
        const expected: Token[] = [{kind: "TK_NUMBER", value: +1} as TokenNumber];
        expect(tokenize('+1')).toStrictEqual(expected);
    });

    it('negative one', () => {
      const expected: Token[] = [{kind: "TK_NUMBER", value: -1} as TokenNumber];
      expect(tokenize('-1')).toStrictEqual(expected);
  });

    it('one plus two', () => {
        const expected: Token[] = [{kind: "TK_LEFT"} as TokenLeft,
                                   {kind: "TK_IDENTIFIER", value: "+"} as TokenIdentifier,
                                   {kind: "TK_NUMBER", value: 1} as TokenNumber,
                                   {kind: "TK_NUMBER", value: 2} as TokenNumber,
                                   {kind: "TK_RIGHT"} as TokenRight,
                                  ];
        expect(tokenize('(+ 1 2)')).toStrictEqual(expected);
    });

    it('invalid parentheses', () => {
        expect(tokenize('(')[0].kind).toStrictEqual("TK_ERROR");
    });

});
