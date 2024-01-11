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

describe('While statement', () => {
  test('while condition with boolean variable', () => {
    const operations = [
      { code: 'var a = true; while (a) { a = false; }', expected: [['a', false]] },
      { code: 'var a = false; while (a) { a = true; }', expected: [['a', false]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
  
      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('while unary condition with boolean variable', () => {
    const operations = [
      { code: 'var a = true; while (!a) { a = false; }', expected: [['a', true]] },
      { code: 'var a = false; while (!a) { a = true; }', expected: [['a', true]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
  
      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('while condition with array member access', () => {
    const operations = [
      { code: 'var a = [1, 2, 3]; var i = 0; while (a[i] === 1) { i++; }', expVars: [['i', 1]], expArrVars: [['a', [1, 2, 3]]] },
      { code: 'var a = [1, 2, 3]; var i = 0; while (a[i] === 2) { i++; }', expVars: [['i', 0]], expArrVars: [['a', [1, 2, 3]]] },
    ];
    operations.forEach(({ code, expVars, expArrVars }) => {
      variables = [];
      arrayVariables = [];
  
      interpret(code);
      expect(arrayVariables).toEqual(expArrVars);
      expect(variables).toEqual(expVars);
    });
  });

  test('while condition with function call', () => {
    const operations = [
      { code: 'var cond = true; function a() { return cond; } while (a()) { cond = false; }', expected: [['cond', false]] },
      { code: 'var cond = false; function a() { return cond; } while (a()) { a = true; }', expected: [['cond', false]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
  
      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('while condition with arithmetic operation', () => {
    const operations = [
      { code: 'var a = 1; while (a + 1 === 2) { a++; }', expected: [['a', 2]] },
      { code: 'var a = 1; while (a + 1 === 3) { a++; }', expected: [['a', 1]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
  
      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('while condition with boolean operation', () => {
    const operations = [
      { code: 'var a = true; var b = false; while (a && b) { a = false; }', expected: [['a', true], ['b', false]] },
      { code: 'var a = true; var b = false; while (a || b) { a = false; }', expected: [['a', false], ['b', false]] },
      { code: 'var a = true; var b = false; while (!(a && b) && (a || b)) { a = false; }', expected: [['a', false], ['b', false]] },
      { code: 'var a = true; var b = false; while (!b === a) { b = true; }', expected: [['a', true], ['b', true]] },
      { code: 'var a = 5; var b = 10; while (a < b) { a++; }', expected: [['a', 10], ['b', 10]] },
      { code: 'var a = 5; var b = 10; while (a > b) { a++; }', expected: [['a', 5], ['b', 10]] },
      { code: 'var a = 5; var b = 10; while (a <= b) { a++; }', expected: [['a', 11], ['b', 10]] },
      { code: 'var a = 5; var b = 10; while (a >= b) { a++; }', expected: [['a', 5], ['b', 10]] },
      { code: 'var a = 5; var b = 10; while (a === b) { a++; }', expected: [['a', 5], ['b', 10]] },
      { code: 'var a = 5; var b = 10; while (a !== b) { a++; }', expected: [['a', 10], ['b', 10]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
  
      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('nested while', () => {
    const operations = [
      { code: 'var c = 0; var a = 0; while (a < 10) { var b = 0; while (b < 10) { c++; b++; } a++; }', expected: [['c', 100],['a', 10]] },
      { code: 'var c = 0; var a = 0; while (a < 10) { var b = 0; while (b < 5) { c++; b++; } a++; }', expected: [['c', 50],['a', 10]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
  
      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('while update', () => {
    const operations = [
      { code: 'var a = 0; var b = 0; while (a++ < 10) { b++; }', expected: [['a', 11],['b',10]] },
      { code: 'var a = 10; var b = 0; while (a-- > 0) { b++; }', expected: [['a', -1],['b',10]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
  
      interpret(code);
      expect(variables).toEqual(expected);
    });
  });
});
