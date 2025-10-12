import { describe, it, expect } from 'vitest'
import { lex, Token } from '../src/lexer'
import { parse } from '../src/anf_parser';
import { _Expression, _Call, _Binding, _Identifier, _Lambda, _Boolean, _Number, _String, _Block, walk } from '../src/anf_ast';

describe('in-place editing', () => {
    it('must be able to assign node Ids in pre-order', () => {
        const text: string = "(! false)";
        const parsed = parse(lex(text));

        let counter = {index: 100};
        const visitor = { pre: (node: _Expression, context: {index: number}) => { node.id = context.index; context.index++;} };
        const answer = walk(parsed.ast, visitor, counter);

        expect(counter.index).toBe(104);
        expect(parsed.ast.id).toBe(100); // block
        expect(parsed.ast.body.id).toBe(101); // call
        expect(parsed.ast.body.fn.id).toBe(102); // !
        expect(parsed.ast.body.arg.id).toBe(103); // false
    });

    it('must be able to assign node Ids in post-order', () => {
        const text: string = "(! false)";
        const parsed = parse(lex(text));

        let counter = {index: 100};
        const visitor = { post: (node: _Expression, context: {index: number}) => { node.id = context.index; context.index++;} };
        const answer = walk(parsed.ast, visitor, counter);
        expect(parsed.ast.id).toBe(103); // block
        expect(parsed.ast.body.id).toBe(102); // call
        expect(parsed.ast.body.fn.id).toBe(100); // !
        expect(parsed.ast.body.arg.id).toBe(101); // false
    });

    it('must be able to traverse nested expressions', () => {
        const text: string = "((+ 1) 2)";
        const parsed = parse(lex(text));

        let counter = {index: 100};
        const visitor = { pre: (node: _Expression, context: {index: number}) => { node.id = context.index; context.index++;} };
        const answer = walk(parsed.ast, visitor, counter);
        expect(parsed.ast.id).toBe(100); // block
        expect(parsed.ast.body.id).toBe(101); // call
        expect(parsed.ast.body.fn.id).toBe(102); // block
        expect(parsed.ast.body.fn.body.id).toBe(103); // call
        expect(parsed.ast.body.fn.body.fn.id).toBe(104); // +
        expect(parsed.ast.body.fn.body.arg.id).toBe(105); // 1
        expect(parsed.ast.body.arg.id).toBe(106); // 2
    });
});
