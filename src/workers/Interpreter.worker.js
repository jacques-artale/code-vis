/* eslint-disable no-restricted-globals */
import { Interpreter } from './../modules/Interpreter';

let interpreter = null;

self.addEventListener('message', (e) => {
  if (e.data.command === 'initialize') {
    interpreter = new Interpreter();
  } else if (e.data.command === 'interpretAll') {
    if (interpreter !== null) {
      interpreter.interpretParsedCode(e.data.code);
    } else {
      console.error('Interpreter not initialized before interpreting code');
    }
  } else if (e.data.command === 'interpretNext') {
    console.error('InterpretNext not implemented yet');
  }
});
