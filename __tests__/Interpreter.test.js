import build_ast from '../src/modules/ASTBuilder';
import { Interpreter } from '../src/modules/Interpreter';

let variables = [];
let array_variables = [];
let log = [];
let parsedCode = '';

const setVariables = (new_variables) => { variables = new_variables; };
const setArrayVariables = (new_array_variables) => { array_variables = new_array_variables; };
const setLog = (new_log) => { log = new_log; };
const setParsedCode = (new_parsedCode) => { parsedCode = new_parsedCode; };

let interpreter;

// Reset variables before each test
beforeEach(() => {    
  variables = [];
  array_variables = [];
  log = [];
  parsedCode = '';

  interpreter = new Interpreter(setVariables, setArrayVariables, setLog);
});

describe('Declarations', () => {
  test('Declare variable', () => {
    const code = 'var a = 1;';
    build_ast(code, setParsedCode);
    interpreter.interpretParsedCode(parsedCode);
    expect(variables).toEqual([['a', 1]]);
  });

  test('Array declaration', () => {
    const code = 'var a = [1, 2, 3];';
    build_ast(code, setParsedCode);
    interpreter.interpretParsedCode(parsedCode);
    expect(array_variables).toEqual([['a', [1, 2, 3]]]);
  });

  test('Object declaration', () => {
    const code = 'var a = {b: 1, c: 2};';
    build_ast(code, setParsedCode);
    interpreter.interpretParsedCode(parsedCode);
    expect(variables).toEqual([['a', {b: 1, c: 2}]]);
  });
});

describe('Variable assignment', () => {  
  test('Arithmetic operations assignment to variable', () => {
    const operations = [
      { code: 'var a = 1 + 2;', expected: [['a', 3]] },
      { code: 'var a = 1 - 2;', expected: [['a', -1]] },
      { code: 'var a = 1 * 2;', expected: [['a', 2]] },
      { code: 'var a = 1 / 2;', expected: [['a', 0.5]] },
      { code: 'var a = 1 % 2;', expected: [['a', 1]] },
      { code: 'var a = (1 + 2) * 3 / 4 % 5;', expected: [['a', 2.25]] },
    ]
    operations.forEach(({ code, expected }) => {
      variables = [];
      interpreter.clearInternalState();

      build_ast(code, setParsedCode);
      interpreter.interpretParsedCode(parsedCode);
      expect(variables).toEqual(expected);
    });
  });

  test('Assign unary expression to variable', () => {
    const code = 'var a = -1;';
    build_ast(code, setParsedCode);
    interpreter.interpretParsedCode(parsedCode);
    expect(variables).toEqual([['a', -1]]);
  });

  test('Arithmetic operations of variables assignment to variable', () => {
    const operations = [
      { code: 'var a = 1; var b = a;', expected: [['a', 1], ['b', 1]] },
      { code: 'var a = 1; var b = 2; var c = a + b;', expected: [['a', 1], ['b', 2], ['c', 3]] },
      { code: 'var a = 1; var b = 2; var c = a - b;', expected: [['a', 1], ['b', 2], ['c', -1]] },
      { code: 'var a = 1; var b = 2; var c = a * b;', expected: [['a', 1], ['b', 2], ['c', 2]] },
      { code: 'var a = 1; var b = 2; var c = a / b;', expected: [['a', 1], ['b', 2], ['c', 0.5]] },
      { code: 'var a = 1; var b = 2; var c = a % b;', expected: [['a', 1], ['b', 2], ['c', 1]] },
      { code: 'var a = 1; var b = 2; var c = (a + b) * 3 / 4 % b;', expected: [['a', 1], ['b', 2], ['c', 0.25]] },
    ]
    operations.forEach(({ code, expected }) => {
      variables = [];
      interpreter.clearInternalState();

      build_ast(code, setParsedCode);
      interpreter.interpretParsedCode(parsedCode);
      expect(variables).toEqual(expected);
    });
  });

  test('Assign function call to variable', () => {
    const code = 'function a() { return 1; } var b = a();';
    build_ast(code, setParsedCode);
    interpreter.interpretParsedCode(parsedCode);
    expect(variables).toEqual([['b', 1]]);
  });

  test('Assign array to variable', () => {});   // TODO: Implement
  test('Assign object to variable', () => {});  // TODO: Implement
});

describe('Array assignment', () => {
  test('Arithmetic operations assignment to array', () => {
    const operations = [
      { code: 'var a = [1, 2, 3]; a[0] = 1 + 2;', expected: [['a', [3, 2, 3]]] },
      { code: 'var a = [1, 2, 3]; a[0] = 1 - 2;', expected: [['a', [-1, 2, 3]]] },
      { code: 'var a = [1, 2, 3]; a[0] = 1 * 2;', expected: [['a', [2, 2, 3]]] },
      { code: 'var a = [1, 2, 3]; a[0] = 1 / 2;', expected: [['a', [0.5, 2, 3]]] },
      { code: 'var a = [1, 2, 3]; a[0] = 1 % 2;', expected: [['a', [1, 2, 3]]] },
      { code: 'var a = [1, 2, 3]; a[0] = (1 + 2) * 3 / 4 % 5;', expected: [['a', [2.25, 2, 3]]] },
    ]
    operations.forEach(({ code, expected }) => {
      array_variables = [];
      interpreter.clearInternalState();

      build_ast(code, setParsedCode);
      interpreter.interpretParsedCode(parsedCode);
      expect(array_variables).toEqual(expected);
    });
  });

  test('Assign unary expression to array', () => {
    const code = 'var a = [1, 2, 3]; a[0] = -1;';
    build_ast(code, setParsedCode);
    interpreter.interpretParsedCode(parsedCode);
    expect(array_variables).toEqual([['a', [-1, 2, 3]]]);
  });

  test('Assign function call to array', () => {
    const code = 'function a() { return 1; } var b = [3, 3, 3]; b[0] = a();';
    build_ast(code, setParsedCode);
    interpreter.interpretParsedCode(parsedCode);
    expect(array_variables).toEqual([['b', [1, 3, 3]]]);
  });
});

describe('Object assignment', () => {});

describe('Variable access', () => {});
describe('Array access', () => {});
describe('Object access', () => {});

describe('Function declaration', () => {});
describe('Function call', () => {});
describe('If statement', () => {});
describe('While statement', () => {});
describe('For statement', () => {});
describe('Do-while statement', () => {});
