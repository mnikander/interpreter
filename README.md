# Symbolic Interpreter (work in progress)

A simple interpreter for symbolic expressions which runs in the browser.
The goal is to implement the core of a [lambda language](https://github.com/mnikander/lambda).

## Try it online

Just visit the GitHub page for this [interpreter](https://mnikander.github.io/interpreter/) and start coding in your browser!
You can compute `1 + 2` with:

```lisp
> (+ 1 2)
3
```

and `1 + (2 * 3)` with:
```lisp
> (+ 1 (* 2 3))
7
```

You can get a full list of available commands with:
```lisp
(help)
```

## Development setup

```bash
sudo apt install nodejs npm
git clone git@github.com:mnikander/interpreter.git
cd interpreter/
npm install  # install project dependencies
npm test     # build and run the unit tests
npm run dev  # host the HTML page locally for development, automatically reloads when source files are changed
```
