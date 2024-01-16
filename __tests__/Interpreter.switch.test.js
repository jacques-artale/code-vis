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

describe('Switch statement', () => {
  test('switch with different cases', () => {
    const operations = [
      { code: 'var a = 1; switch(a) { case 1: a++; break; case 2: a--; break; default: a = 0; }', expected: [['a', 2]] },
      { code: 'var a = 2; switch(a) { case 1: a++; break; case 2: a--; break; default: a = 0; }', expected: [['a', 1]] },
      { code: 'var a = 3; switch(a) { case 1: a++; break; case 2: a--; break; default: a = 0; }', expected: [['a', 0]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];

      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('switch with array member access', () => {
    const operations = [
      { code: 'var a = [1, 2, 3]; var i = 0; switch(a[i]) { case 1: a[i]++; break; case 2: a[i]--; break; default: a[i] = 0; }', expVars: [['i', 0]], expArrVars: [['a', [2, 2, 3]]] },
      { code: 'var a = [1, 2, 3]; var i = 1; switch(a[i]) { case 1: a[i]++; break; case 2: a[i]--; break; default: a[i] = 0; }', expVars: [['i', 1]], expArrVars: [['a', [1, 1, 3]]] },
      { code: 'var a = [1, 2, 3]; var i = 2; switch(a[i]) { case 1: a[i]++; break; case 2: a[i]--; break; default: a[i] = 0; }', expVars: [['i', 2]], expArrVars: [['a', [1, 2, 0]]] },
    ];
    operations.forEach(({ code, expVars, expArrVars }) => {
      variables = [];
      arrayVariables = [];

      interpret(code);
      expect(arrayVariables).toEqual(expArrVars);
      expect(variables).toEqual(expVars);
    });
  });

  test('switch with object property access', () => {
    const operations = [
      { code: 'var a = {b: 1}; switch(a.b) { case 1: a.b++; break; case 2: a.b--; break; default: a.b = 0; }', expected: [['a', {b: 2}]] },
      { code: 'var a = {b: 2}; switch(a.b) { case 1: a.b++; break; case 2: a.b--; break; default: a.b = 0; }', expected: [['a', {b: 1}]] },
      { code: 'var a = {b: 3}; switch(a.b) { case 1: a.b++; break; case 2: a.b--; break; default: a.b = 0; }', expected: [['a', {b: 0}]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];

      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('switch with function call', () => {
    const operations = [
      { code: 'var a = 0; function f() { return 1; } switch(f()) { case 1: a++; break; case 2: a--; break; default: a = 0; }', expected: [['a', 1]] },
      { code: 'var a = 0; function f() { return 2; } switch(f()) { case 1: a++; break; case 2: a--; break; default: a = 0; }', expected: [['a', -1]] },
      { code: 'var a = 0; function f() { return 3; } switch(f()) { case 1: a++; break; case 2: a--; break; default: a = 0; }', expected: [['a', 0]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];

      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('trigger multiple cases in switch', () => {
    const operations = [
      { code: 'var a = 0; switch(a) { case 0: a++; case 1: a++; case 3: a++; break; default: a = 0; }', expected: [['a', 3]] },
      { code: 'var a = 1; switch(a) { case 0: a++; case 1: a++; case 2: a--; break; default: a = 0; }', expected: [['a', 1]] },
      { code: 'var a = 0; switch(a) { case 0: a++; case 1: a++; case 2: a++; default: a = 10; }', expected: [['a', 10]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];

      interpret(code);
      expect(variables).toEqual(expected);
    });    
  });

  test('nested switch', () => {
    const operations = [
      { code: 'var a = 0, b = 1; switch(a) { case 0: switch(b) { case 1: a++; break; } break; default: a = 10; }', expected: [['a', 1], ['b', 1]] },
      { code: 'var a = 0, b = 2; switch(a) { case 0: switch(b) { case 1: a++; break; } break; default: a = 10; }', expected: [['a', 0], ['b', 2]] },
      { code: 'var a = 1, b = 1; switch(a) { case 0: switch(b) { case 1: a++; break; } break; default: a = 10; }', expected: [['a', 10], ['b', 1]] }
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];

      interpret(code);
      expect(variables).toEqual(expected);      
    });
  });

  test('switch with no default case', () => {
    const operations = [
      { code: 'var a = 0; switch(a) { case 0: a++; break; }', expected: [['a', 1]] },
      { code: 'var a = 0; switch(a) { case 1: a++; break; }', expected: [['a', 0]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];

      interpret(code);
      expect(variables).toEqual(expected);      
    });
  });

  test('switch cases with same value', () => {
    const operations = [
      { code: 'var a = 0; switch(a) { case 0: a++; break; case 0: a--; break; default: a = 10; }', expected: [['a', 1]] },
      { code: 'var a = 0; switch(a) { case 1: a++; break; case 1: a--; break; default: a = 10; }', expected: [['a', 10]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];

      interpret(code);
      expect(variables).toEqual(expected);      
    });
  });
});
