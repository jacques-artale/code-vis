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

describe('break', () => {
  test('while loop with break statement', () => {
    const operations = [
      { code: 'var a = 0; while (true) { a++; break; }', expected: [['a', 1]] },
      { code: 'var a = 0; while (false) { a++; break; }', expected: [['a', 0]] },
      { code: 'var a = 0; while (a === 0) { break; a++ }', expected: [['a', 0]] },
      { code: 'var a = 0; while (a < 10) { a++; if (a === 5) { break; } }', expected: [['a', 5]] },
      { code: 'var a = 0; while (a < 10) { if (a === 5) { break; } a++; }', expected: [['a', 5]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
  
      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('for loop with break statement', () => {
    const operations = [
      { code: 'var a = 0; for (var i = 0; i < 10; i++) { a++; break; }', expected: [['a', 1]] },
      { code: 'var a = 0; for (var i = 0; i < 10; i++) { break; a++; }', expected: [['a', 0]] },
      { code: 'var a = 0; for (var i = 0; i < 10; i++) { a++; if (a === 5) { break; } }', expected: [['a', 5]] },
      { code: 'var a = 0; for (var i = 0; i < 10; i++) { if (a === 5) { break; } a++; }', expected: [['a', 5]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
  
      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('do-while with break statement', () => {
    const operations = [
      { code: 'var a = 0; do { a++; break; } while (true);', expected: [['a', 1]] },
      { code: 'var a = 0; do { a++; if (a === 5) { break; } } while (a < 10);', expected: [['a', 5]] },
      { code: 'var a = 0; do { if (a === 5) { break; } a++; } while (a < 10);', expected: [['a', 5]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
  
      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('nested while loops with break statement', () => {
    const operations = [
      { code: 'var a = 0; var b = 0; while (a < 5) { while (b < 5) { b++; break; } a++; }', expected: [['a', 5], ['b', 5]] },
      { code: 'var a = 0; var b = 0; while (a < 5) { a++; if (a === 3) { while (b < 5) { b++; if (b === 3) { break; } } } }', expected: [['a', 5], ['b', 3]] },
      { code: 'var a = 0; var b = 0; while (a < 5) { a++; if (a === 3) { break; } while (b < 5) { b++; } }', expected: [['a', 3], ['b', 5]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
  
      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('nested for loops with break statement', () => {
    const operations = [
      { code: 'var a = 0; var b = 0; for (a = 0; a < 5; a++) { for (b = 0; b < 5; b++) { break; } }', expected: [['a', 5], ['b', 0]] },
      { code: 'var a = 0; var b = 0; for (a = 0; a < 5; a++) { for (b = 0; b < 5; b++) { if (b === 3) { break; } } }', expected: [['a', 5], ['b', 3]] },
      { code: 'var a = 0; var b = 0; for (a = 0; a < 5; a++) { if (a === 3) { break; } for (b = 0; b < 5; b++) { } }', expected: [['a', 3], ['b', 5]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
  
      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('nested do-while loops with break statement', () => {
    const operations = [
      { code: 'var a = 0; var b = 0; do { a++; do { b++; break; } while (b < 5); } while (a < 5);', expected: [['a', 5], ['b', 5]] },
      { code: 'var a = 0; var b = 0; do { a++; do { b++; if (b === 3) { break; } } while (b < 5); } while (a < 5);', expected: [['a', 5], ['b', 8]] },
      { code: 'var a = 0; var b = 0; do { a++; if (a === 3) { break; } do { b++; } while (b < 5); } while (a < 5);', expected: [['a', 3], ['b', 6]] },
      { code: 'var a = 0; var b = 0; do { a++; do { if (b === 3) { break; } b++; } while (b < 5); } while (a < 5);', expected: [['a', 5], ['b', 3]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
  
      interpret(code);
      expect(variables).toEqual(expected);
    });
  });
});
