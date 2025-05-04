import { describe, it, expect } from 'vitest'
import { Environment, Symbol, builtin, lookup } from '../src/environment'
import { ASTAtom } from '../src/parser';

describe('global environment lookup', () => {

    it('must return the definition when an identifier is defined globally', () => {
        const symbol: undefined | Symbol = lookup({ kind: 'ND_IDENTIFIER', value: '+'}, builtin);
        expect(symbol).toBeTruthy();
        const result = (symbol?.value as Function)([1, 2]);
        expect(result).toBe(3);
    });

    it('must return undefined when an identifier is NOT defined globally', () => {
        const symbol: undefined | Symbol = lookup({ kind: 'ND_IDENTIFIER', value: '?'}, builtin);
        expect(symbol).toBe(undefined);
    });

});

describe('local environment lookup', () => {

    const localEnvironment: Environment = {
        parent: builtin,
        symbols: new Map<string, Symbol>([
            ['?', { kind: "EV_FUNCTION", arity: 3, value: function ( args: any[] )    { return args[0] ? args[1] : args[2]; } }],
            ['-', { kind: "EV_FUNCTION", arity: 1, value: function ( args: number[] ) { return -args[0]; } }], // override minus to mean negation
        ]),
    };

    it('must return the definition when an identifier is defined in the local scope, and not in the enclosing scope', () => {
        const symbol: undefined | Symbol = lookup({ kind: 'ND_IDENTIFIER', value: '?'}, localEnvironment);
        expect(symbol).toBeTruthy();
        const result = (symbol?.value as Function)([true, 42, 0]);
        expect(result).toBe(42);
    });

    it('must return the local definition when a local identifier shadows an identifier in the enclosing scope', () => {
        const symbol: undefined | Symbol = lookup({ kind: 'ND_IDENTIFIER', value: '-'}, localEnvironment);
        expect(symbol).toBeTruthy();
        const result = (symbol?.value as Function)([1]);
        expect(result).toBe(-1);
    });

    it('must return the definition when an identifier is defined in the enclosing scope', () => {
        const symbol: undefined | Symbol = lookup({ kind: 'ND_IDENTIFIER', value: '+'}, localEnvironment);
        expect(symbol).toBeTruthy();
        const result = (symbol?.value as Function)([1, 2]);
        expect(result).toBe(3);
    });

    it('must return undefined when an identifier is NOT defined in the scope or the enclosing scopes', () => {
        const symbol: undefined | Symbol = lookup({ kind: 'ND_IDENTIFIER', value: '+++'}, localEnvironment);
        expect(symbol).toBe(undefined);
    });

});
