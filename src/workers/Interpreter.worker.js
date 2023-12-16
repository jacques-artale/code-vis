/* eslint-disable no-restricted-globals */
import { Interpreter } from './../modules/Interpreter';

let interpreter = null;

self.addEventListener('message', (e) => {
  if (interpreter === null) {
    interpreter = new Interpreter(e.data.code, self.postMessage.bind(self));
  }

  if (e.data.command === 'interpretAll') {
    interpreter.interpretAllInstructions();
  } else if (e.data.command === 'interpretNext') {
    interpreter.interpretNextInstruction();
  }
});
