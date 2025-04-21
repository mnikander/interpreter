import { describe, it, expect } from 'vitest'
import { to_token, tokenize, Token} from '../src/lexer.js'

describe('to_token', () => {

    it('zero', () => {
        const expected: Token = {kind: "TokenNumber", value: 0} as Token;
        expect(to_token('0')).toStrictEqual(expected);
    });

    it('True', () => {
        const expected: Token = {kind: "TokenBoolean", value: true} as Token;
        expect(to_token('True')).toStrictEqual(expected);
    });

    it('False', () => {
        const expected: Token = {kind: "TokenBoolean", value: false} as Token;
        expect(to_token('False')).toStrictEqual(expected);
    });

    it('left', () => {
        const expected: Token = {kind: "TokenLeft", value: "("} as Token;
        expect(to_token('(')).toStrictEqual(expected);
    });

    it('right', () => {
        const expected: Token = {kind: "TokenRight", value: ")"} as Token;
        expect(to_token(')')).toStrictEqual(expected);
    });

    it('add', () => {
        const expected: Token = {kind: "TokenIdentifier", value: "+"} as Token;
        expect(to_token('+')).toStrictEqual(expected);
    });

    it('custom function', () => {
        expect(to_token('my_function').kind).toStrictEqual("TokenIdentifier");
    });

    it('custom operation', () => {
        expect(to_token('???').kind).toStrictEqual("TokenIdentifier");
    });

    it('invalid identifiers', () => {
        expect(to_token('$a').kind).toStrictEqual("TokenError");
        expect(to_token('a$').kind).toStrictEqual("TokenError");
        expect(to_token('$1').kind).toStrictEqual("TokenError");
        expect(to_token('1$').kind).toStrictEqual("TokenError");
        expect(to_token('1a').kind).toStrictEqual("TokenError");
        expect(to_token('1_').kind).toStrictEqual("TokenError");
        expect(to_token('_+').kind).toStrictEqual("TokenError");
    });
});

describe('tokenize', () => {

    it('zero', () => {
        const expected: Token[] = [{kind: "TokenNumber", value: 0} as Token];
        expect(tokenize('0')).toStrictEqual(expected);
    });

    it('positive one', () => {
        const expected: Token[] = [{kind: "TokenNumber", value: +1} as Token];
        expect(tokenize('+1')).toStrictEqual(expected);
    });

    it('negative one', () => {
      const expected: Token[] = [{kind: "TokenNumber", value: -1} as Token];
      expect(tokenize('-1')).toStrictEqual(expected);
  });

    it('one plus two', () => {
        const expected: Token[] = [{kind: "TokenLeft"} as Token,
                                   {kind: "TokenIdentifier", value: "+"} as Token,
                                   {kind: "TokenNumber", value: 1} as Token,
                                   {kind: "TokenNumber", value: 2} as Token,
                                   {kind: "TokenRight"} as Token,
                                  ];
        expect(tokenize('(+ 1 2)')).toStrictEqual(expected);
    });

    it('invalid parentheses', () => {
        expect(tokenize('(')[0].kind).toStrictEqual("TokenError");
    });

});
