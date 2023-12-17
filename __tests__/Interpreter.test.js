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

describe('Declarations', () => {
  test('Declare variable', () => {
    const code = 'var a = 1;';
    const parsedCode = buildAst(code);
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toEqual([['a', 1]]);
  });

  test('Array declaration', () => {
    const code = 'var a = [1, 2, 3];';
    const parsedCode = buildAst(code);
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(arrayVariables).toEqual([['a', [1, 2, 3]]]);
  });

  test('Object declaration', () => {
    const code = 'var a = {b: 1, c: 2};';
    const parsedCode = buildAst(code);
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toEqual([['a', {b: 1, c: 2}]]);
  });
});

describe('Array access', () => {
  test('Array access', () => {
    const code = 'var a = [1, 2, 3]; var b = a[0];';
    const parsedCode = buildAst(code);
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(arrayVariables).toEqual([['a', [1, 2, 3]]]);
    expect(variables).toEqual([['b', 1]]);
  });

  test('Two-dimensional array access', () => {
    const code = 'var a = [[1, 2, 3], [4, 5, 6]]; var b = a[1][1];';
    const parsedCode = buildAst(code);
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(arrayVariables).toEqual([['a', [[1, 2, 3], [4, 5, 6]]]]);
    expect(variables).toEqual([['b', 5]]);
  });

  test('Three-dimensional array access', () => {
    const code = 'var a = [[[1, 2, 3], [4, 5, 6]], [[7, 8, 9], [10, 11, 12]]]; var b = a[1][1][1];';
    const parsedCode = buildAst(code);
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(arrayVariables).toEqual([['a', [[[1, 2, 3], [4, 5, 6]], [[7, 8, 9], [10, 11, 12]]]]]);
    expect(variables).toEqual([['b', 11]]);
  });
});

describe('Object access', () => {
  test('Object property access', () => {
    const code = 'var a = {b: 1}; var c = a.b;';
    const parsedCode = buildAst(code);
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toContainEqual(['a', {b: 1}]);
    expect(variables).toContainEqual(['c', 1]);
  });

  test('Array access of object', () => {
    const code = 'var a = {b: [1,2,3]}; var c = a.b[1];';
    const parsedCode = buildAst(code);
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toContainEqual(['a', {b: [1, 2, 3]}]);
    expect(variables).toContainEqual(['c', 2]);
  });

  test('Multidimensional array access of object property', () => {
    const code = 'var a = {b: [[1, 2, 3], [4, 5, 6]]}; var c = a.b[1][1];';
    const parsedCode = buildAst(code);
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toContainEqual(['a', {b: [[1, 2, 3], [4, 5, 6]]}]);
    expect(variables).toContainEqual(['c', 5]);
  });

  test('Object access of object property', () => {
    const code = 'var a = {b: {c: 1}}; var d = a.b.c;';
    const parsedCode = buildAst(code);
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toContainEqual(['a', {b: {c: 1}}]);
    expect(variables).toContainEqual(['d', 1]);
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

      const parsedCode = buildAst(code);
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
      expect(variables).toEqual(expected);
    });
  });

  test('Assign unary expression to variable', () => {
    const code = 'var a = -1;';
    const parsedCode = buildAst(code);
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toEqual([['a', -1]]);
  });

  test('Assign variable to variable', () => {
    const code = 'var a = 1; var b = a;';
    const parsedCode = buildAst(code);
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toContainEqual(['a', 1]);
    expect(variables).toContainEqual(['b', 1]);
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

      const parsedCode = buildAst(code);
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
      expect(variables).toEqual(expected);
    });
  });

  test('Assign function call to variable', () => {
    const code = 'function a() { return 1; } var b = a();';
    const parsedCode = buildAst(code);
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toEqual([['b', 1]]);
  });

  test('Assign object property to variable', () => {
    const code = 'var a = {b: 1}; var c = a.b;';
    const parsedCode = buildAst(code);
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toContainEqual(['a', {b: 1}]);
    expect(variables).toContainEqual(['c', 1]);
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

      const parsedCode = buildAst(code);
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
      expect(arrayVariables).toEqual(expected);
    });
  });

  test('Assign unary expression to array', () => {
    const code = 'var a = [1, 2, 3]; a[0] = -1;';
    const parsedCode = buildAst(code);
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(arrayVariables).toEqual([['a', [-1, 2, 3]]]);
  });

  test('Assign variable to array', () => {
    const code = 'var a = 1; var b = [3, 3, 3]; b[0] = a;';
    const parsedCode = buildAst(code);
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(arrayVariables).toEqual([['b', [1, 3, 3]]]);
  });

  test('Assign function call to array', () => {
    const code = 'function a() { return 1; } var b = [3, 3, 3]; b[0] = a();';
    const parsedCode = buildAst(code);
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(arrayVariables).toEqual([['b', [1, 3, 3]]]);
  });
});

describe('Object assignment', () => {
  test('Assign function call to object', () => {
    const code = 'function a() { return {b: 1}; } var c = a();';
    const parsedCode = buildAst(code);
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toEqual([['c', {b: 1}]]);
  });

  test('Assign value to object property', () => {
    const code = 'var a = {b: 1}; a.b = 2;';
    const parsedCode = buildAst(code);
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toEqual([['a', {b: 2}]]);
  });

  test('Assign object variable to object', () => {
    const code = 'var a = {b: 1}; var c = a;';
    const parsedCode = buildAst(code);
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toContainEqual(['a', {b: 1}]);
    expect(variables).toContainEqual(['c', {b: 1}]);
  });

  test('Assign variable to object property', () => {
    const code = 'var a = 1; var b = {c: 2}; b.c = a;';
    const parsedCode = buildAst(code);
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toEqual([['a', 1], ['b', {c: 1}]]);
  });

  test('Assign array to object property', () => {
    const code = 'var a = [1, 2, 3]; var b = {c: 2}; b.c = a;';
    const parsedCode = buildAst(code);
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(arrayVariables).toEqual([['a', [1, 2, 3]]]);
    expect(variables).toEqual([['b', {c: [1, 2, 3]}]]);
  });

  test('Assign object to object property', () => {
    const code = 'var a = {b: 1}; var c = {d: 2}; c.d = a;';
    const parsedCode = buildAst(code);
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toEqual([['a', {b: 1}], ['c', {d: {b: 1}}]]);
  });

  test('Assign function call to object property', () => {
    const code = 'function a() { return 1; } var b = {c: 2}; b.c = a();';
    const parsedCode = buildAst(code);
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toEqual([['b', {c: 1}]]);
  });
});

describe('Function declaration', () => {});
describe('Function call', () => {});
describe('If statement', () => {});
describe('While statement', () => {});
describe('For statement', () => {});
describe('Do-while statement', () => {});

describe('Scope', () => {});
