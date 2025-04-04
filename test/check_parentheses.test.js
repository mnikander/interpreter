import { describe, it, expect } from 'vitest'
import { check_parentheses } from '../src/parentheses.js'

describe('check_parentheses', () => {

  it('(', () => {
    expect(check_parentheses('(')).toBe(false)
  }); 

  it(')', () => {
    expect(check_parentheses(')')).toBe(false)
  });

  it('((', () => {
    expect(check_parentheses('((')).toBe(false)
  })

  it('))', () => {
    expect(check_parentheses('))')).toBe(false)
  })

  it(')(', () => {
    expect(check_parentheses(')(')).toBe(false)
  })

  it('()', () => {
    expect(check_parentheses('()')).toBe(true)
  });

});
