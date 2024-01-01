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

describe('For statement', () => {
  test('for basic update', () => {
    const operations = [
      { code: 'var a = 0; for (var i = 0; i < 10; i++) { a++; }', expected: [['a', 10]] },
      { code: 'var a = 10; for (var i = 10; i > 0; i--) { a--; }', expected: [['a', 0]] }
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('for iterate over array', () => {
    const operations = [
      { code: 'var a = [1, 2, 3, 4, 5]; var sum = 0; for (var i = 0; i < 5; i++) { sum += a[i]; }', expected: [['sum', 15]] },
      { code: 'var a = [1, 2, 3, 4, 5]; var sum = 0; for (var i = 4; i >= 0; i--) { sum += a[i]; }', expected: [['sum', 15]] }
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('nested for', () => {
    const operations = [
      { code: 'var a = 0; for (var i = 0; i < 5; i++) { for (var j = 0; j < 5; j++) { a++; } }', expected: [['a', 25]] }
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('for multiple variable declaration', () => {
    const operations = [
      { code: 'var a = 0; var b = 10; for (var i = 0, j = 10; i < j; i++, j--) { a++; b--; }', expected: [['a', 5], ['b', 5]] }
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('for condition with arithmetic operation', () => {
    const operations = [
      { code: 'var a = 0; for (var i = 0; i < 10 * 2; i++) { a++; }', expected: [['a', 20]] }
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('for condition with boolean operation', () => {
    const operations = [
      { code: 'var a = 0; for (var i = 0; i < 10 && a < 5; i++) { a++; }', expected: [['a', 5]] }
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('for condition with array member access', () => {
    const operations = [
      { code: 'var a = [1, 2, 3, 4, 5]; var sum = 0; for (var i = 0; i < a[2]; i++) { sum += i; }', expected: [['sum', 3]] }
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
      interpret(code);
      expect(variables).toEqual(expected);
    });
  });
});
