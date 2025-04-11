import { describe, it, expect } from 'vitest'
import { to_token, tokenize, Token, TokenLeft, TokenRight, TokenAdd, TokenNumber, TokenError } from '../src/lexer.js'

describe('to_token', () => {

    it('zero', () => {
        const expected: Token = {name: "TK_NUMBER", value: 0} as TokenNumber;
        expect(to_token('0')).toStrictEqual(expected);
    });

    it('left', () => {
        const expected: Token = {name: "TK_LEFT"} as TokenLeft;
        expect(to_token('(')).toStrictEqual(expected);
    });

    it('right', () => {
        const expected: Token = {name: "TK_RIGHT"} as TokenRight;
        expect(to_token(')')).toStrictEqual(expected);
    });

    it('add', () => {
        const expected: Token = {name: "TK_ADD"} as TokenAdd;
        expect(to_token('+')).toStrictEqual(expected);
    });

    it('unknown', () => {
        expect(to_token('???').name).toStrictEqual("TK_ERROR");
    });
});


describe('tokenize', () => {

    it('zero', () => {
        const expected: Token[] = [{name: "TK_NUMBER", value: 0} as TokenNumber];
        expect(tokenize('0')).toStrictEqual(expected);
    });

    it('positive one', () => {
        const expected: Token[] = [{name: "TK_NUMBER", value: +1} as TokenNumber];
        expect(tokenize('+1')).toStrictEqual(expected);
    });

    it('negative one', () => {
      const expected: Token[] = [{name: "TK_NUMBER", value: -1} as TokenNumber];
      expect(tokenize('-1')).toStrictEqual(expected);
  });

    it('one plus two', () => {
        const expected: Token[] = [{name: "TK_LEFT"} as TokenLeft,
                                   {name: "TK_ADD"} as TokenAdd,
                                   {name: "TK_NUMBER", value: 1} as TokenNumber,
                                   {name: "TK_NUMBER", value: 2} as TokenNumber,
                                   {name: "TK_RIGHT"} as TokenRight,
                                  ];
        expect(tokenize('(+ 1 2)')).toStrictEqual(expected);
    });

    it('invalid parentheses', () => {
        expect(tokenize('(')[0].name).toStrictEqual("TK_ERROR");
    });

});
