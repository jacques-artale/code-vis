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

describe('Array length', () => {
  test('Length of array', () => {
    const code = 'const arr = [1, 2, 3]; var a = arr.length;';
    interpret(code);
    expect(variables).toEqual([['a', 3]]);
    expect(arrayVariables).toEqual([['arr', [1, 2, 3]]]);
  });

  test('Length of multidimensional array', () => {
    const code = 'const arr = [[1, 2], [3, 4], [5, 6]]; var a = arr.length;';
    interpret(code);
    expect(variables).toEqual([['a', 3]]);
    expect(arrayVariables).toEqual([['arr', [[1, 2], [3, 4], [5, 6]]]]);
  });

  test('Length of empty array', () => {
    const code = 'const arr = []; var a = arr.length;';
    interpret(code);
    expect(variables).toEqual([['a', 0]]);
    expect(arrayVariables).toEqual([['arr', []]]);
  });

  test('Length of array in variable', () => {
    const code = 'const arr = [1, 2, 3]; var a = arr; var b = a.length;';
    interpret(code);
    expect(variables).toEqual([['b', 3]]);
    expect(arrayVariables).toEqual([['arr', [1, 2, 3]], ['a', [1, 2, 3]]]);
  });

  test('Length of array in object', () => {
    const code = 'const obj = { arr: [1, 2, 3] }; var a = obj.arr.length;';
    interpret(code);
    expect(variables).toContainEqual(['a', 3]);
    expect(variables).toContainEqual(['obj', { arr: [1, 2, 3] }]);
  });
});

describe('String length', () => {
  test('Length of string', () => {
    const code = 'const str = "abc"; var a = str.length;';
    interpret(code);
    expect(variables).toEqual([['str', 'abc'], ['a', 3]]);
  });

  test('Length of empty string', () => {
    const code = 'const str = ""; var a = str.length;';
    interpret(code);
    expect(variables).toEqual([['str', ''], ['a', 0]]);
  });

  test('Length of string in variable', () => {
    const code = 'const str = "abc"; var a = str; var b = a.length;';
    interpret(code);
    expect(variables).toEqual([['str', 'abc'], ['a', 'abc'], ['b', 3]]);
  });

  test('Length of string in object', () => {
    const code = 'const obj = { str: "abc" }; var a = obj.str.length;';
    interpret(code);
    expect(variables).toContainEqual(['a', 3]);
    expect(variables).toContainEqual(['obj', { str: 'abc' }]);
  });
});
