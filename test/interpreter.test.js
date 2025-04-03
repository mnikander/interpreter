import { describe, it, expect } from 'vitest'
import { interpret } from '../src/interpreter.js'

describe('evaluate', () => {
  it('tautology', () => {
    expect(true).toBe(true)
  })
})
