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

describe('Do-while statement', () => {
  test('do-while condition with boolean variable', () => {
    const operations = [
      { code: 'var a = 0; var b = true; do { a = 1; b = false; } while (b);', expected: [['a', 1], ['b', false]] },
      { code: 'var a = 0; var b = false; do { a = 1; b = true; } while (!b);', expected: [['a', 1], ['b', true]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];

      interpret(code);
      expect(variables).toEqual(expected);
    });
  });
  
  test('do-while condition with array member access', () => {
    const operations = [
      { code: 'var a = [1, 2, 3]; var i = 0; do { i++; } while (a[i] === 1);', expVars: [['i', 1]], expArrVars: [['a', [1, 2, 3]]] },
      { code: 'var a = [1, 2, 3]; var i = 0; do { i++; } while (a[i] === 2);', expVars: [['i', 2]], expArrVars: [['a', [1, 2, 3]]] },
    ];
    operations.forEach(({ code, expVars, expArrVars }) => {
      variables = [];
      arrayVariables = [];

      interpret(code);
      expect(arrayVariables).toEqual(expArrVars);
      expect(variables).toEqual(expVars);
    });
  });

  test('do-while condition with function call', () => {
    const code = 'var count = 0; var cond = true; function a() { return cond; } do { count++; cond = false; } while (a());';
    interpret(code);
    expect(variables).toEqual([['count', 1], ['cond', false]]);
  });

  test('do-while condition with arithmetic operation', () => {
    const operations = [
      { code: 'var a = 1; do { a++; } while (a === 2);', expected: [['a', 3]] },
      { code: 'var a = 1; do { a++; } while (a === 3);', expected: [['a', 2]] },
      { code: 'var a = 1; do { a--; } while (a === 1);', expected: [['a', 0]] },
      { code: 'var a = 1; do { a++; } while (a + 1 === 3);', expected: [['a', 3]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];

      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('do-while condition with boolean operation', () => {
    const operations = [
      { code: 'var a = true; var b = false; do { a = false; } while (a && b);', expected: [['a', false], ['b', false]] },
      { code: 'var a = true; var b = false; do { a = false; } while (a || b);', expected: [['a', false], ['b', false]] },
      { code: 'var a = true; var b = false; do { b = !b; } while (!a && !b);', expected: [['a', true], ['b', true]] },
      { code: 'var a = 5; var b = 10; do { a++; } while (a < b);', expected: [['a', 10], ['b', 10]] },
      { code: 'var a = 5; var b = 10; do { a++; } while (a > b);', expected: [['a', 6], ['b', 10]] },
      { code: 'var a = 0; var b = 10; do { a++; b--; } while (a != b);', expected: [['a', 5], ['b', 5]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];

      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('nested do-while', () => {
    const operations = [
      { code: 'var c = 0; var a = 0; do { var b = 0; do { c++; b++; } while (b < 10); a++; } while (a < 10);', expected: [['c', 100],['a', 10]] },
      { code: 'var c = 0; var a = 0; do { var b = 0; do { c++; b++; } while (b < 5); a++; } while (a < 10);', expected: [['c', 50],['a', 10]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];

      interpret(code);
      expect(variables).toEqual(expected);
    });
  });
});
