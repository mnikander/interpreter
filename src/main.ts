// Copyright (c) 2025 Marco Nikander

import { interpret } from "./interpret";

function run_interpreter() {
    const inputEl = document.getElementById("input") as HTMLInputElement;
    const outputEl = document.getElementById("output") as HTMLPreElement;
  
    const input = inputEl.value;
    const result = interpret(input);
  
    outputEl.textContent += `> ${input}\n${result}\n`;
  }

document.addEventListener('DOMContentLoaded', () => {

    const output = document.getElementById("output");
    if (output) {
        output.textContent = "Welcome! Try typing:\n\n(+ 1 2)\n\nand press Enter.\n\n";
    }

    const inputField = document.getElementById("input");
    inputField?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission or newline
            run_interpreter();
        }
    });
});
