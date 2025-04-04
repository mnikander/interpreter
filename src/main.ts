import { interpret } from "./interpreter";

function run_interpreter() {
    const inputEl = document.getElementById("input") as HTMLInputElement;
    const outputEl = document.getElementById("output") as HTMLPreElement;
  
    const input = inputEl.value;
    const result = interpret(input);
  
    outputEl.textContent += `> ${input}\n${result}\n`;
  }

document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById("input");
    inputField?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission or newline
            run_interpreter();
        }
    });
});
