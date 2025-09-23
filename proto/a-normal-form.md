# A-Normal Form

A few examples:

`(+(+ 2 (* 3 4)) 5)`

Translates to 
```
let r2 = * 3 4 in
let r1 = + 2 r2 in
let r0 = + r1 5 in
r0
```

In the following example, the control-flow jumps back up several times, to
parse each sub-tree of the if-expression one after the other.

`(if (< 2 5) (+ 2 (* 3 4)) (- 2 3))`

```
r0
let r0 = if r1 r2 r3
let r1 = < 2 5
let r2 = + 2 r3
let r3 = * 3 4
```

## What do I want?
- to try a single-pass, syntax directed translation from Lisp to ANF
- to store the ANF in a flat array
- to traverse and index the the variables in pre-order (for borrow-checking and evaluation)
- the code to be small and simple
- a clean mechanism to handle and report errors, without a hundred if-else clauses that garble the code
- pretty printing in ML-notation

## What do I need, to do this?
- input tokens: string
- output array store the resulting ANF
- single pass over the code
- tokenization, parsing, creation of intermediate variables, and storage in the array, in one go
- a counter, for the variables
- datatype for an ANF entry, it's a node type which references other array entries by id
- perhaps I can put the ANF on a stack, and traverse in reverse to 
- the ability to return back up in the control-flow, to handle sub-expressions one at a time: recursive descent parsing is probably easiest

---
**Copyright (c) 2025 Marco Nikander**
