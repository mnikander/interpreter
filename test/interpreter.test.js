import { describe, it, expect } from 'vitest'
import { interpret } from '../src/interpret.ts'

describe('evaluate', () => {
  it('tautology', () => {
    expect(true).toBe(true)
  })
})
