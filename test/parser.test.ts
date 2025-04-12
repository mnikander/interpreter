import { describe, it, expect } from 'vitest'
import { Node, parse } from '../src/parser.ts'
import { TokenLeft } from '../src/lexer.ts'

describe('parse', () => {
    it('error', () => {
        let ast: Node = parse([{kind: "TK_LEFT"} as TokenLeft]);
        expect(ast.kind).toBe("ND_ERROR");
    });
})
