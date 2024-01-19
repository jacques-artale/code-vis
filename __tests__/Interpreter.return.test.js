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

describe('Return from function', () => {
  test('Return no value', () => {
    const code = 'function a() { return; } var b = 0; a(); var c = 1;';
    interpret(code);
    expect(variables).toEqual([['b', 0], ['c', 1]]);
  });

  test('Return value', () => {
    const code = 'function a() { return 0; } var b = a()';
    interpret(code);
    expect(variables).toEqual([['b', 0]]);
  });

  test('Return variable', () => {
    const code = 'function a() { var b = 0; return b; } var c = a();';
    interpret(code);
    expect(variables).toEqual([['c', 0]]);
  });

  test('Return array', () => {
    const code = 'function a() { var b = [0, 1]; return b; } var c = a();';
    interpret(code);
    expect(arrayVariables).toEqual([['c', [0, 1]]]);
  });

  test('Return array element', () => {
    const code = 'function a() { var b = [1, 2, 3]; return b[1]; } var c = a();';
    interpret(code);
    expect(variables).toEqual([['c', 2]]);
  });

  test('Return array element from variable', () => {
    const code = 'function a() { var b = [1, 2, 3]; var c = 1; return b[c]; } var d = a();';
    interpret(code);
    expect(variables).toEqual([['d', 2]]);
  });

  test('Return object', () => {
    const code = 'function a() { var b = { a: 0, b: 1 }; return b; } var c = a();';
    interpret(code);
    expect(variables).toEqual([['c', { a: 0, b: 1 }]]);
  });

  test('Return object property', () => {
    const code = 'function a() { var b = { a: 0, b: 1 }; return b.a; } var c = a();';
    interpret(code);
    expect(variables).toEqual([['c', 0]]);
  });

  test('Return arithmetic expression', () => {
    const operations = [
      { code: 'function a() { return 1 + 2; } var b = a();', expected: [['b', 3]] },
      { code: 'function a() { return 1 - 2; } var b = a();', expected: [['b', -1]] },
      { code: 'function a() { return 1 * 2; } var b = a();', expected: [['b', 2]] },
      { code: 'function a() { return 1 / 2; } var b = a();', expected: [['b', 0.5]] },
      { code: 'function a() { return 1 % 2; } var b = a();', expected: [['b', 1]] },
      { code: 'function a() { var b = 10; var c = 23; return b * c; } var d = a();', expected: [['d', 230]] },
    ]
    operations.forEach(({ code, expected }) => {
      variables = [];

      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('Return boolean expression', () => {
    const operations = [
      { code: 'function a() { return 1 === 2; } var b = a();', expected: [['b', false]] },
      { code: 'function a() { return 1 !== 2; } var b = a();', expected: [['b', true]] },
      { code: 'function a() { return 1 < 2; } var b = a();', expected: [['b', true]] },
      { code: 'function a() { return 1 <= 2; } var b = a();', expected: [['b', true]] },
      { code: 'function a() { return 1 > 2; } var b = a();', expected: [['b', false]] },
      { code: 'function a() { return 1 >= 2; } var b = a();', expected: [['b', false]] },
      { code: 'function a() { var b = 10; var c = 23; return b > c; } var d = a();', expected: [['d', false]] },
    ]
    operations.forEach(({ code, expected }) => {
      variables = [];

      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('Multiple return statements', () => {
    const code = 'function a() { return 2; return 3; } var b = a();';
    interpret(code);
    expect(variables).toEqual([['b', 2]]);
  });

  test('Return from within if statement', () => {
    const code = 'function a() { if (true) { return 1; } return 0; } var b = a();';
    interpret(code);
    expect(variables).toEqual([['b', 1]]);
  });

  test('Return from within for statement', () => {
    const code = 'function a() { for (var i = 0; i < 10; i++) { return i; } } var b = a();';
    interpret(code);
    expect(variables).toEqual([['b', 0]]);
  });

  test('Return from within while statement', () => {
    const code = 'function a() { var i = 0; while (i < 10) { i++; return i; } } var b = a();';
    interpret(code);
    expect(variables).toEqual([['b', 1]]);
  });

  test('Return from within do while statement', () => {
    const code = 'function a() { var i = 0; do { i++; return i; } while (i < 10); } var b = a();';
    interpret(code);
    expect(variables).toEqual([['b', 1]]);
  });

  test('Return from within switch statement', () => {
    const code = 'function a() { var i = 1; switch (i) { case 0: return 1; case 1: return 2; default: return 0; } } var b = a();';
    interpret(code);
    expect(variables).toEqual([['b', 2]]);
  });
});

