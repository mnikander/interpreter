import { describe, it, expect } from 'vitest'
import { EvaluationEnvironment, EvaluationSymbol, evaluation_lookup } from '../src/evaluation_environment'
import { global_evaluation_environment } from '../src/global_environments';

describe('global functions', () => {
    it('must return the definition when an identifier is defined globally', () => {
        const symbol: undefined | EvaluationSymbol = evaluation_lookup({ kind: 'ND_IDENTIFIER', value: '+'}, global_evaluation_environment);
        expect(symbol).toBeTruthy();
        const result = (symbol?.value as Function)([1, 2]);
        expect(result).toBe(3);
    });

    it('must return undefined when an identifier is NOT defined globally', () => {
        const symbol: undefined | EvaluationSymbol = evaluation_lookup({ kind: 'ND_IDENTIFIER', value: '?'}, global_evaluation_environment);
        expect(symbol).toBe(undefined);
    });
});

describe('local functions', () => {
    const local_evaluation_environment: EvaluationEnvironment = {
        parent: global_evaluation_environment,
        symbols: new Map<string, EvaluationSymbol>([
            ['?', { kind: "EVALUATOR_FUNCTION", value: function ( args: any[] )    { return args[0] ? args[1] : args[2]; } }],
            ['-', { kind: "EVALUATOR_FUNCTION", value: function ( args: number[] ) { return -args[0]; } }], // override minus to mean negation
        ]),
    };

    it('must return the definition when an identifier is defined in the local scope, and not in the enclosing scope', () => {
        const symbol: undefined | EvaluationSymbol = evaluation_lookup({ kind: 'ND_IDENTIFIER', value: '?'}, local_evaluation_environment);
        expect(symbol).toBeTruthy();
        const result = (symbol?.value as Function)([true, 42, 0]);
        expect(result).toBe(42);
    });

    it('must return the local definition when a local identifier shadows an identifier in the enclosing scope', () => {
        const symbol: undefined | EvaluationSymbol = evaluation_lookup({ kind: 'ND_IDENTIFIER', value: '-'}, local_evaluation_environment);
        expect(symbol).toBeTruthy();
        const result = (symbol?.value as Function)([1]);
        expect(result).toBe(-1);
    });

    it('must return the definition when an identifier is defined in the enclosing scope', () => {
        const symbol: undefined | EvaluationSymbol = evaluation_lookup({ kind: 'ND_IDENTIFIER', value: '+'}, local_evaluation_environment);
        expect(symbol).toBeTruthy();
        const result = (symbol?.value as Function)([1, 2]);
        expect(result).toBe(3);
    });

    it('must return undefined when an identifier is NOT defined in the scope or the enclosing scopes', () => {
        const symbol: undefined | EvaluationSymbol = evaluation_lookup({ kind: 'ND_IDENTIFIER', value: '+++'}, local_evaluation_environment);
        expect(symbol).toBe(undefined);
    });
});

describe('local variables', () => {
    it('must return the value of a variable', () => {
        const env: EvaluationEnvironment = {
            parent: undefined,
            symbols: new Map<string, EvaluationSymbol>([
                ['the_answer', { kind: "EVALUATOR_VALUE", value: 42 }],
            ]),
        };

        const result: undefined | EvaluationSymbol = evaluation_lookup({ kind: 'ND_IDENTIFIER', value: 'the_answer'}, env);
        expect(result?.value).toBe(42);
    });
});
