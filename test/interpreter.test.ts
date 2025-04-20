import { describe, it, expect } from 'vitest'
import { interpret } from '../src/interpret.js'

describe('interpret', () => {
  
  it('integer', () => {
    const result = interpret("5");
    expect(result).toBe(5);
  });

  it('addition', () => {
    const result = interpret("(+ 1 2)");
    expect(result).toBe(3);
  });

  it('invalid addition', () => {
    const result = interpret("(+ 1 2 3)");
    expect(result).toContain("ERROR");
    expect(result).toContain("argument");
  });

  it('left-nested addition', () => {
    const result = interpret("(+ (+ 1 2) 3)");
    expect(result).toBe(6);
  });

  it('right-nested addition', () => {
    const result = interpret("(+ 1 (+ 2 3))");
    expect(result).toBe(6);
  });

  it('boolean', () => {
    const result = interpret("True");
    expect(result).toBe(true);
  });

  it('and', () => {
    const ff = interpret("(& False False)");
    expect(ff).toBe(false);

    const ft = interpret("(& False True)");
    expect(ft).toBe(false);

    const tf = interpret("(& True False)");
    expect(tf).toBe(false);

    const tt = interpret("(& True True)");
    expect(tt).toBe(true);
  });

  it('or', () => {
    const ff = interpret("(| False False)");
    expect(ff).toBe(false);

    const ft = interpret("(| False True)");
    expect(ft).toBe(true);

    const tf = interpret("(| True False)");
    expect(tf).toBe(true);

    const tt = interpret("(| True True)");
    expect(tt).toBe(true);
  });
});
