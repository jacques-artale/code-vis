import buildAst from '../src/modules/ASTBuilder';
import { Interpreter } from '../src/modules/Interpreter';

let variables = [];
let arrayVariables = [];
let log = [];

function updateVariables(data) {
  if (data.command === 'updateVariables') {
    variables = data.variables;
    arrayVariables = data.arrayVariables;
  } else if (data.command === 'consoleLog') {
    log = [...log, data.argument];
  } else {
    console.error('Unknown command: ' + data.command);
  }
}

// Reset variables before each test
beforeEach(() => {
  variables = [];
  arrayVariables = [];
  log = [];
});

function interpret(code) {
  const parsedCode = buildAst(code).code;
  const interpreter = new Interpreter(parsedCode, updateVariables);
  interpreter.interpretAllInstructions();
}

describe('Declarations', () => {
  test('Declare variable', () => {
    const code = 'var a = 1;';
    interpret(code);
    expect(variables).toEqual([['a', 1]]);
  });

  test('Array declaration', () => {
    const code = 'var a = [1, 2, 3];';
    interpret(code);
    expect(arrayVariables).toEqual([['a', [1, 2, 3]]]);
  });

  test('Object declaration', () => {
    const code = 'var a = {b: 1, c: 2};';
    interpret(code);
    expect(variables).toEqual([['a', {b: 1, c: 2}]]);
  });
});
