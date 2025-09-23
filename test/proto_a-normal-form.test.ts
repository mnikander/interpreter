import { describe, it, expect } from 'vitest'
import { parse, _Number, _Boolean, _String, _Identifier } from '../proto/a-normal-form'

describe('parse atoms', () => {

    it('must parse "true" to a boolean', () => {
        const input: string = 'true';
        const parsed = parse(input);
        expect(parsed[0].tag).toBe("Boolean");
        expect((parsed[0] as _Boolean).value).toBe(true);
    });

    it('must parse "1" to a number', () => {
        const input: string = '1';
        const parsed = parse(input);
        expect(parsed[0].tag).toBe("Number");
        expect((parsed[0] as _Number).value).toEqual(1);
    });

    it('must parse "-0.1" to a number', () => {
        const input: string = '-0.1';
        const parsed = parse(input);
        expect(parsed[0].tag).toBe("Number");
        expect((parsed[0] as _Number).value).toEqual(-0.1);
    });

    it('must parse "hello world" to a string', () => {
        const input: string = '"hello world"';
        const parsed = parse(input);
        expect(parsed[0].tag).toBe("String");
        expect((parsed[0] as _String).value).toEqual('\"hello world\"');
    });

    it("must parse 'hello world' to a string", () => {
        const input: string = "'hello world'";
        const parsed = parse(input);
        expect(parsed[0].tag).toBe("String");
        expect((parsed[0] as _String).value).toEqual('\'hello world\'');
    });

    it('must parse "+" to an identifier', () => {
        const input: string = "+";
        const parsed = parse(input);
        expect(parsed[0].tag).toBe("Identifier");
        expect((parsed[0] as _Identifier).name).toEqual("+");
    });
});
