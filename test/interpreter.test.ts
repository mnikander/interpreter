import { describe, it, expect } from 'vitest'
import { interpret } from '../src/interpret.js'

describe('evaluate', () => {
  it('tautology', () => {
    expect(true).toBe(true)
  })
})
