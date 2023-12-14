import buildAst from '../src/modules/ASTBuilder';
import { Interpreter } from '../src/modules/Interpreter';

let variables = [];
let arrayVariables = [];
let log = [];
let parsedCode = '';

let interpreter;

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
  parsedCode = '';

  interpreter = new Interpreter(updateVariables);
});

describe('Declarations', () => {
  test('Declare variable', () => {
    const code = 'var a = 1;';
    const parsedCode = buildAst(code);
    interpreter.interpretParsedCode(parsedCode);
    expect(variables).toEqual([['a', 1]]);
  });

  test('Array declaration', () => {
    const code = 'var a = [1, 2, 3];';
    const parsedCode = buildAst(code);
    interpreter.interpretParsedCode(parsedCode);
    expect(arrayVariables).toEqual([['a', [1, 2, 3]]]);
  });

  test('Object declaration', () => {
    const code = 'var a = {b: 1, c: 2};';
    const parsedCode = buildAst(code);
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

      const parsedCode = buildAst(code);
      interpreter.interpretParsedCode(parsedCode);
      expect(variables).toEqual(expected);
    });
  });

  test('Assign unary expression to variable', () => {
    const code = 'var a = -1;';
    const parsedCode = buildAst(code);
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

      const parsedCode = buildAst(code);
      interpreter.interpretParsedCode(parsedCode);
      expect(variables).toEqual(expected);
    });
  });

  test('Assign function call to variable', () => {
    const code = 'function a() { return 1; } var b = a();';
    const parsedCode = buildAst(code);
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
      arrayVariables = [];
      interpreter.clearInternalState();

      const parsedCode = buildAst(code);
      interpreter.interpretParsedCode(parsedCode);
      expect(arrayVariables).toEqual(expected);
    });
  });

  test('Assign unary expression to array', () => {
    const code = 'var a = [1, 2, 3]; a[0] = -1;';
    const parsedCode = buildAst(code);
    interpreter.interpretParsedCode(parsedCode);
    expect(arrayVariables).toEqual([['a', [-1, 2, 3]]]);
  });

  test('Assign function call to array', () => {
    const code = 'function a() { return 1; } var b = [3, 3, 3]; b[0] = a();';
    const parsedCode = buildAst(code);
    interpreter.interpretParsedCode(parsedCode);
    expect(arrayVariables).toEqual([['b', [1, 3, 3]]]);
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
