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

describe('Array access', () => {
  test('Array access', () => {
    const code = 'var a = [1, 2, 3]; var b = a[0];';
    interpret(code);
    expect(arrayVariables).toEqual([['a', [1, 2, 3]]]);
    expect(variables).toEqual([['b', 1]]);
  });

  test('Two-dimensional array access', () => {
    const code = 'var a = [[1, 2, 3], [4, 5, 6]]; var b = a[1][1];';
    interpret(code);
    expect(arrayVariables).toEqual([['a', [[1, 2, 3], [4, 5, 6]]]]);
    expect(variables).toEqual([['b', 5]]);
  });

  test('Three-dimensional array access', () => {
    const code = 'var a = [[[1, 2, 3], [4, 5, 6]], [[7, 8, 9], [10, 11, 12]]]; var b = a[1][1][1];';
    interpret(code);
    expect(arrayVariables).toEqual([['a', [[[1, 2, 3], [4, 5, 6]], [[7, 8, 9], [10, 11, 12]]]]]);
    expect(variables).toEqual([['b', 11]]);
  });

  test('Array access with variable', () => {
    const code = 'var a = [1, 2, 3]; var b = 1; var c = a[b];';
    interpret(code); 
    expect(variables).toEqual([['b', 1], ['c', 2]]);
  });

  test('Array access of function call', () => {
    const code = 'function a() { return [1, 2, 3]; } var b = a()[1];';
    interpret(code);  
    expect(variables).toEqual([['b', 2]]);
  });

  test('Array access of function call with variable', () => {
    const code = 'function a() { return [1, 2, 3]; } var b = 1; var c = a()[b];';
    interpret(code);   
    expect(variables).toEqual([['b', 1], ['c', 2]]);
  });
});

describe('Object access', () => {
  test('Object property access', () => {
    const code = 'var a = {b: 1}; var c = a.b;';
    interpret(code);
    expect(variables).toContainEqual(['a', {b: 1}]);
    expect(variables).toContainEqual(['c', 1]);
  });

  test('Array access of object', () => {
    const code = 'var a = {b: [1,2,3]}; var c = a.b[1];';
    interpret(code);
    expect(variables).toContainEqual(['a', {b: [1, 2, 3]}]);
    expect(variables).toContainEqual(['c', 2]);
  });

  test('Multidimensional array access of object property', () => {
    const code = 'var a = {b: [[1, 2, 3], [4, 5, 6]]}; var c = a.b[1][1];';
    interpret(code);
    expect(variables).toContainEqual(['a', {b: [[1, 2, 3], [4, 5, 6]]}]);
    expect(variables).toContainEqual(['c', 5]);
  });

  test('Object access of object property', () => {
    const code = 'var a = {b: {c: 1}}; var d = a.b.c;';
    interpret(code);
    expect(variables).toContainEqual(['a', {b: {c: 1}}]);
    expect(variables).toContainEqual(['d', 1]);
  });
});
