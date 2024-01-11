import { buildAst } from '../src/modules/ASTBuilder';
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

describe('if statement', () => {
  test('if condition boolean', () => {
    const operations = [
      { code: 'var a = 0; if (true) { a = 1; }', expected: [['a', 1]] },
      { code: 'var a = 0; if (false) { a = 1; }', expected: [['a', 0]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];

      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('if unary condition boolean', () => {
    const operations = [
      { code: 'var a = 0; if (!true) { a = 1; }', expected: [['a', 0]] },
      { code: 'var a = 0; if (!false) { a = 1; }', expected: [['a', 1]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];

      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('if-else condition boolean', () => {
    const operations = [
      { code: 'var a = 0; if (true) { a = 1; } else { a = 2; }', expected: [['a', 1]] },
      { code: 'var a = 0; if (false) { a = 1; } else { a = 2; }', expected: [['a', 2]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];

      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('Nested if-else', () => {
    const operations = [
      { code: 'var a = 0; if (true) { if (true) { a = 1; } else { a = 2; } } else { a = 3; }', expected: [['a', 1]] },
      { code: 'var a = 0; if (true) { if (false) { a = 1; } else { a = 2; } } else { a = 3; }', expected: [['a', 2]] },
      { code: 'var a = 0; if (false) { if (true) { a = 1; } else { a = 2; } } else { a = 3; }', expected: [['a', 3]] },
      { code: 'var a = 0; if (false) { if (false) { a = 1; } else { a = 2; } } else { a = 3; }', expected: [['a', 3]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];

      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('if condition with boolean variable', () => {
    const operations = [
      { code: 'var a = true; var b = 0; if (a) { b = 1; }', expected: [['a', true], ['b', 1]] },
      { code: 'var a = false; var b = 0; if (a) { b = 1; }', expected: [['a', false], ['b', 0]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];

      interpret(code);
      expected.forEach(([name, value]) => {
        expect(variables).toContainEqual([name, value]);
      });
    });
  });

  test('if-else condition with boolean variable', () => {
    const operations = [
      { code: 'var a = true; var b = 0; if (a) { b = 1; } else { b = 2; }', expected: [['a', true], ['b', 1]] },
      { code: 'var a = false; var b = 0; if (a) { b = 1; } else { b = 2; }', expected: [['a', false], ['b', 2]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];

      interpret(code);
      expected.forEach(([name, value]) => {
        expect(variables).toContainEqual([name, value]);
      });
    });
  });

  test('if contition with array member access', () => {
    const operations = [
      { code: 'var a = [1, 2, 3]; var b = 0; if (a[0] === 1) { b = 1; }', expVar: [['b', 1]], expArr: [['a', [1, 2, 3]]] },
      { code: 'var a = [1, 2, 3]; var b = 0; if (a[0] === 2) { b = 1; }', expVar: [['b', 0]], expArr: [['a', [1, 2, 3]]] },
    ];
    operations.forEach(({ code, expVar, expArr }) => {
      variables = [];
      arrayVariables = [];
  
      interpret(code);
      expect(arrayVariables).toEqual(expArr);
      expect(variables).toEqual(expVar);
    });
  });

  test('if condition with function call', () => {
    const operations = [
      { code: 'function a() { return true; } var b = 0; if (a()) { b = 1; }', expected: [['b', 1]] },
      { code: 'function a() { return false; } var b = 0; if (a()) { b = 1; }', expected: [['b', 0]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
  
      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('if condition with arithmetic operation', () => {
    const operations = [
      { code: 'var a = 1; var b = 0; if (a + 1 === 2) { b = 1; }', expected: [['a', 1], ['b', 1]] },
      { code: 'var a = 1; var b = 0; if (a + 1 === 3) { b = 1; }', expected: [['a', 1], ['b', 0]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
  
      interpret(code);
  
      expect(variables).toEqual(expected);
    });
  });

  test('if condition with boolean operation', () => {
    const operations = [
      { code: 'var a = true; var b = false; var c = 0; if (a && b) { c = 1; }', expected: [['a', true], ['b', false], ['c', 0]] },
      { code: 'var a = true; var b = false; var c = 0; if (a || b) { c = 1; }', expected: [['a', true], ['b', false], ['c', 1]] },
      { code: 'var a = true; var b = false; var c = 0; if (!(a && b) && (a || b)) { c = 1; }', expected: [['a', true], ['b', false], ['c', 1]] },
      { code: 'var a = true; var b = 0; if (!b) { b = 1; }', expected: [['a', true], ['b', 1]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
  
      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('if-else-if condition', () => {
    const operations = [
      { code: 'var a = 0; if (a === 1) { a = 1; } else if (a === 0) { a = 2; }', expected: [['a', 2]] },
      { code: 'var a = 1; if (a === 0) { a = 1; } else if (a === 1) { a = 2; }', expected: [['a', 2]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
  
      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('if-else-if-else condition', () => {
    const operations = [
      { code: 'var a = 0; if (a === 0) { a = 1; } else if (a === 1) { a = 2; } else { a = 3; }', expected: [['a', 1]] },
      { code: 'var a = 1; if (a === 0) { a = 1; } else if (a === 1) { a = 2; } else { a = 3; }', expected: [['a', 2]] },
      { code: 'var a = 2; if (a === 0) { a = 1; } else if (a === 1) { a = 2; } else { a = 3; }', expected: [['a', 3]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
  
      interpret(code);
      expect(variables).toEqual(expected);
    });
  });
});
