// Copyright (c) 2025 Marco Nikander

import { interpret } from "./interpreter";

function run_interpreter() {
    const inputEl = document.getElementById("input") as HTMLInputElement;
    const outputEl = document.getElementById("output") as HTMLPreElement;

    if (outputEl) {
    const observer = new MutationObserver(() => {
        outputEl.scrollTop = outputEl.scrollHeight;
    });

    observer.observe(outputEl, { childList: true });
}
    const input = inputEl.value;
    const result = interpret(input);
  
    outputEl.textContent += `> ${input}\n${result}\n`;
  }

document.addEventListener('DOMContentLoaded', () => {

    // Help menu logic (toggle with one button)
    const helpBtn = document.getElementById("help-btn");
    const helpBox = document.getElementById("help-box");

    helpBtn?.addEventListener("click", () => {
        if (helpBox && helpBtn) {
            if (helpBox.style.display === "block") {
                helpBox.style.display = "none";
                helpBtn.textContent = "Help";
            } else {
                helpBox.style.display = "block";
                helpBtn.textContent = "Close Help";
            }
        }
    });

    const output = document.getElementById("output");
    if (output) {
        output.textContent = "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nWelcome! Try typing:\n\n(+ 1 2)\n\nand press Enter. For more info run:\n\n(help)\n\n";
    }

    const inputField = document.getElementById("input") as HTMLInputElement;

    // set the focus to the end of the input field, so the cursor is at end of the default text '(help)'
    inputField?.focus();
    inputField?.setSelectionRange(inputField.value.length, inputField.value.length);

    inputField?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission or newline
            run_interpreter();
        }
    });
});
