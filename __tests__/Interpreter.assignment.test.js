import { buildAst } from '../src/modules/ASTBuilder';
import { Interpreter } from '../src/modules/Interpreter';

let variables = [];
let arrayVariables = [];
let log = [];

function updateVariables(data) {
  if (data.command === 'updateScopes') {
    variables = data.scopes[0].variables;
    arrayVariables = data.scopes[0].arrayVariables;
  } else if (data.command === 'consoleLog') {
    log = [...log, data.argument];
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

      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('Assign unary expression to variable', () => {
    const code = 'var a = -1;';
    interpret(code);
    expect(variables).toEqual([['a', -1]]);
  });

  test('Assign variable to variable', () => {
    const code = 'var a = 1; var b = a;';
    interpret(code);
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
      { code: 'var a = "hello "; var b = "world"; var c = a + b;', expected: [['a', 'hello '], ['b', 'world'], ['c', 'hello world']] },
      { code: 'var a = "hello "; var b = 10; var c = a + b;', expected: [['a', 'hello '], ['b', 10], ['c', 'hello 10']] },
    ]
    operations.forEach(({ code, expected }) => {
      variables = [];

      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('Assign function call to variable', () => {
    const code = 'function a() { return 1; } var b = a();';
    interpret(code);
    expect(variables).toEqual([['b', 1]]);
  });

  test('Assign object property to variable', () => {
    const code = 'var a = {b: 1}; var c = a.b;';
    interpret(code);
    expect(variables).toContainEqual(['a', {b: 1}]);
    expect(variables).toContainEqual(['c', 1]);
  });

  test('Assign arithmetic operation of array members to variable', () => {
    const code = 'var a = [1, 2, 3]; var b = a[0] + a[1];';
    interpret(code);
    expect(arrayVariables).toEqual([['a', [1, 2, 3]]]);
    expect(variables).toEqual([['b', 3]]);
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
      { code: 'var a = [[1,2,3], [4,5,6], [7,8,9]]; a[1][1] = 1 + 2;', expected: [['a', [[1,2,3], [4,3,6], [7,8,9]]]] },
    ]
    operations.forEach(({ code, expected }) => {
      arrayVariables = [];

      interpret(code);
      expect(arrayVariables).toEqual(expected);
    });
  });

  test('Assign unary expression to array', () => {
    const code = 'var a = [1, 2, 3]; a[0] = -1;';
    interpret(code);
    expect(arrayVariables).toEqual([['a', [-1, 2, 3]]]);
  });

  test('Assign variable to array', () => {
    const code = 'var a = 1; var b = [3, 3, 3]; b[0] = a;';
    interpret(code);
    expect(arrayVariables).toEqual([['b', [1, 3, 3]]]);
  });

  test('Assign function call to array', () => {
    const code = 'function a() { return 1; } var b = [3, 3, 3]; b[0] = a();';
    interpret(code);
    expect(arrayVariables).toEqual([['b', [1, 3, 3]]]);
  });

  test('Assign array to array', () => {
    const code = 'var a = [1, 2, 3]; var b = [4, 5, 6]; a[0] = b;';
    interpret(code);
    expect(arrayVariables).toEqual([['a', [[4, 5, 6], 2, 3]], ['b', [4, 5, 6]]]);
  });

  test('Assign value to multidimensional array', () => {
    const code = 'var a = [[1, 2, 3], [4, 5, 6]]; a[1][1] = 7;';
    interpret(code);
    expect(arrayVariables).toContainEqual(['a', [[1, 2, 3], [4, 7, 6]]]);
  });

  test('Push to array', () => {
    const code = 'var a = [1, 2, 3]; a.push(4);';
    interpret(code);
    expect(arrayVariables).toEqual([['a', [1, 2, 3, 4]]]);
  });
});

describe('Object assignment', () => {
  test('Assign function call to object', () => {
    const code = 'function a() { return {b: 1}; } var c = a();';
    interpret(code);
    expect(variables).toEqual([['c', {b: 1}]]);
  });

  test('Assign value to object property', () => {
    const code = 'var a = {b: 1}; a.b = 2;';
    interpret(code);
    expect(variables).toEqual([['a', {b: 2}]]);
  });

  test('Assign object variable to object', () => {
    const code = 'var a = {b: 1}; var c = a;';
    interpret(code);
    expect(variables).toContainEqual(['a', {b: 1}]);
    expect(variables).toContainEqual(['c', {b: 1}]);
  });

  test('Assign variable to object property', () => {
    const code = 'var a = 1; var b = {c: 2}; b.c = a;';
    interpret(code);
    expect(variables).toEqual([['a', 1], ['b', {c: 1}]]);
  });

  test('Assign array to object property', () => {
    const code = 'var a = [1, 2, 3]; var b = {c: 2}; b.c = a;';
    interpret(code);
    expect(arrayVariables).toEqual([['a', [1, 2, 3]]]);
    expect(variables).toEqual([['b', {c: [1, 2, 3]}]]);
  });

  test('Assign object to object property', () => {
    const code = 'var a = {b: 1}; var c = {d: 2}; c.d = a;';
    interpret(code);
    expect(variables).toEqual([['a', {b: 1}], ['c', {d: {b: 1}}]]);
  });

  test('Assign function call to object property', () => {
    const code = 'function a() { return 1; } var b = {c: 2}; b.c = a();';
    interpret(code);
    expect(variables).toEqual([['b', {c: 1}]]);
  });

  test('Assign value to multidimensional object', () => {
    const code = 'var a = {b: {c: 1}}; a.b.c = 2;';
    interpret(code);
    expect(variables).toContainEqual(['a', {b: {c: 2}}]);
  });
});
