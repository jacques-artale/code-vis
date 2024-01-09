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

describe('Function call', () => {
  test('Function call', () => {
    const code = 'function a() { return 1; } var b = a();';
    interpret(code);
    expect(variables).toEqual([['b', 1]]);
  });

  test('Function call with argument', () => {
    const code = 'function a(b) { return b; } var c = a(1);';
    interpret(code);
    expect(variables).toEqual([['c', 1]]);
  });

  test('Function call with multiple arguments', () => {
    const code = 'function a(b, c) { return b + c; } var d = a(1, 2);';
    interpret(code);
    expect(variables).toContainEqual(['d', 3]);
  });

  test('Function call to console log function', () => {
    const code = [
      { code: 'console.log("Hello world");', expected: ['Hello world'] },
      { code: 'console.log(1);', expected: [1] },
      { code: 'var a = [1,2,3,4]; var i = 1; console.log(a[i]);', expected: [2] },
      { code: 'var a = [1,2,3,4]; var i = 1; console.log(a[i]++);', expected: [2] },
      { code: 'var a = [1,2,3,4]; var i = 1; console.log(++a[i]);', expected: [3] },
    ];
    code.forEach(({ code, expected }) => {
      log = [];

      interpret(code);
      expect(log).toEqual(expected);
    });
  });

  test('Function call to Math max function', () => {
    const operations = [
      { code: 'var a = Math.max(1,2);', expected: [['a', 2]] },
      { code: 'var a = Math.max(2,1);', expected: [['a', 2]] },
      { code: 'var a = -100; var b = 100; var c = Math.max(a,b);', expected: [['a', -100],['b', 100],['c', 100]] },
      { code: 'var a = Math.max(23 * 124, 32 / 2 + 4);', expected: [['a', 2852]] },
      { code: 'function a() { return 10; } function b() { return 12; } var c = Math.max(a(), b());', expected: [['c', 12]] },
      { code: 'var a = Math.max(1,1);', expected: [['a', 1]] },
      { code: 'var a = Math.max(0,0);', expected: [['a', 0]] },
    ];

    operations.forEach(({ code, expected }) => {
      variables = [];

      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('Function call to Math min function', () => {
    const operations = [
      { code: 'var a = Math.min(1,2);', expected: [['a', 1]] },
      { code: 'var a = Math.min(2,1);', expected: [['a', 1]] },
      { code: 'var a = -100; var b = 100; var c = Math.min(a,b);', expected: [['a', -100],['b', 100],['c', -100]] },
      { code: 'var a = Math.min(23 * 124, 32 / 2 + 4);', expected: [['a', 20]] },
      { code: 'function a() { return 10; } function b() { return 12; } var c = Math.min(a(), b());', expected: [['c', 10]] },
      { code: 'var a = Math.min(1,1);', expected: [['a', 1]] },
      { code: 'var a = Math.min(0,0);', expected: [['a', 0]] },
    ];

    operations.forEach(({ code, expected }) => {
      variables = [];

      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('Function call to Math abs function', () => {
    const operations = [
      { code: 'var a = Math.abs(1);', expected: [['a', 1]] },
      { code: 'var a = Math.abs(-1);', expected: [['a', 1]] },
      { code: 'var a = Math.abs(-100);', expected: [['a', 100]] },
      { code: 'var a = Math.abs(100);', expected: [['a', 100]] },
      { code: 'var a = Math.abs(0);', expected: [['a', 0]] },
      { code: 'var a = Math.abs(23 * 124);', expected: [['a', 2852]] },
      { code: 'var a = Math.abs(10 - 100);', expected: [['a', 90]] },
      { code: 'var a = 10; var b = 100; var c = Math.abs(a - b);', expected: [['a', 10],['b', 100],['c', 90]] },
    ];

    operations.forEach(({ code, expected }) => {
      variables = [];

      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('Function call with arithmetic expression argument', () => {
    const code = 'function a(b) { return b; } var c = a(1 + 2);';
    interpret(code);    
    expect(variables).toEqual([['c', 3]]);
  });

  test('Function call with array argument', () => {
    const code = 'function a(b) { return b; } var c = a([1, 2, 3]);';
    interpret(code);    
    expect(arrayVariables).toEqual([['c', [1, 2, 3]]]);
  });

  test('Function call with object argument', () => {
    const code = 'function a(b) { return b; } var c = a({d: 1});';
    interpret(code);    
    expect(variables).toEqual([['c', {d: 1}]]);
  });

  test('Nested function call', () => {
    const code = 'function fac(n) { if (n === 0) { return 1; } return n * fac(n - 1); } var a = fac(4);';
    interpret(code);
    expect(variables).toEqual([['a', 24]]);
  });
});
