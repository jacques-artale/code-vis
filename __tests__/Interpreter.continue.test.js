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

describe('continue', () => {
  test('while loop with continue statement', () => {
    const operations = [
      { code: 'var a = 0; var b = 0; while (b < 10) { b++; a++; continue; }', expected: [['a', 10],['b',10]] },
      { code: 'var a = 0; var b = 0; while (b < 10) { b++; continue; a++; }', expected: [['a', 0],['b',10]] },
      { code: 'var a = 0; var b = 0; while (b < 10) { b++; if (a === 5) { continue; } a++; }', expected: [['a', 5],['b',10]] },
      { code: 'var a = 0; var b = 0; while (b < 10) { b++; a++; if (a === 5) { continue; } }', expected: [['a', 10],['b',10]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
  
      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('for loop with continue statement', () => {
    const operations = [
      { code: 'var a = 0; for (var i = 0; i < 10; i++) { a++; continue; }', expected: [['a', 10]] },
      { code: 'var a = 0; for (var i = 0; i < 10; i++) { continue; a++; }', expected: [['a', 0]] },
      { code: 'var a = 0; for (var i = 0; i < 10; i++) { if (a === 5) { continue; } a++; }', expected: [['a', 5]] },
      { code: 'var a = 0; for (var i = 0; i < 10; i++) { a++; if (a === 5) { continue; } }', expected: [['a', 10]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
  
      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('do-while with continue statement', () => {
    const operations = [
      { code: 'var a = 0; var b = 0; do { b++; a++; continue; } while (b < 10);', expected: [['a', 10], ['b', 10]] },
      { code: 'var a = 0; var b = 0; do { b++; continue; a++; } while (b < 10);', expected: [['a', 0], ['b', 10]] },
      { code: 'var a = 0; var b = 0; do { b++; if (a === 5) { continue; } a++; } while (b < 10);', expected: [['a', 5], ['b', 10]] },
      { code: 'var a = 0; var b = 0; do { b++; a++; if (a === 5) { continue; } } while (b < 10);', expected: [['a', 10], ['b', 10]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
  
      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('nested while loops with continue statement', () => {
    const operations = [
      { code: 'var a = 0; var b = 0; while (a < 5) { a++; while (b < 5) { b++; continue; } }', expected: [['a', 5], ['b', 5]] },
      { code: 'var a = 0; var b = 0; while (a < 5) { a++; while (b < 5) { b++; if (b === 3) { continue; } } }', expected: [['a', 5], ['b', 5]] },
      { code: 'var a = 0; var b = 0; while (a < 5) { a++; if (a === 3) { continue; } while (b < 5) { b++; } }', expected: [['a', 5], ['b', 5]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
  
      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('nested for loops with continue statement', () => {
    const operations = [
      { code: 'var a = 0; var b = 0; for (a = 0; a < 5; a++) { for (b = 0; b < 5; b++) { continue; } }', expected: [['a', 5], ['b', 5]] },
      { code: 'var a = 0; var b = 0; for (a = 0; a < 5; a++) { for (b = 0; b < 5; b++) { if (b === 3) { continue; } } }', expected: [['a', 5], ['b', 5]] },
      { code: 'var a = 0; var b = 0; for (a = 0; a < 5; a++) { if (a === 3) { continue; } for (b = 0; b < 5; b++) { } }', expected: [['a', 5], ['b', 5]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
  
      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('nested do-while loops with continue statement', () => {
    const operations = [
      { code: 'var a = 0; var b = 0; do { a++; do { b++; continue; } while (b < 5); } while (a < 5);', expected: [['a', 5], ['b', 9]] },
      { code: 'var a = 0; var b = 0; do { a++; do { b++; if (b === 3) { continue; } } while (b < 5); } while (a < 5);', expected: [['a', 5], ['b', 9]] },
      { code: 'var a = 0; var b = 0; do { a++; if (a === 3) { continue; } do { b++; } while (b < 5); } while (a < 5);', expected: [['a', 5], ['b', 8]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
  
      interpret(code);
      expect(variables).toEqual(expected);
    });
  });
});
