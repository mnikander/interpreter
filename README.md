# Symbolic Interpreter (work in progress)

A simple interpreter for symbolic expressions which runs in the browser.
The goal is to implement the core of a [lambda language](https://github.com/mnikander/lambda).

## [Try it online](https://mnikander.github.io/interpreter/)

Just visit the GitHub page for this interpreter, using the link above, and start coding in your browser!
You can compute `1 + 2` with:

```lisp
> ((+ 1) 2)
3
```

and `1 + (2 * 3)` with:
```lisp
> ((+ 1) ((* 2) 3))
7
```

Currently, all functions are only available in curried form, so they take only one function argument at a time.
Applying a function to two arguments requires two, nested, function applications, hence the extra parentheses.

You can get the full list of available commands in the 'help' menu of the interpreter.
You can also take a look at this brief [introduction to symbolic expressions](https://github.com/mnikander/lambda/blob/main/resources/symbolic_expression_intro.md).

## Development setup

```bash
sudo apt install nodejs npm
git clone git@github.com:mnikander/interpreter.git
cd interpreter/
npm install  # install project dependencies
npm test     # build and run the unit tests
npm run dev  # host the HTML page locally for development, automatically reloads when source files are changed
```

---
**Copyright (c) 2025 Marco Nikander**
