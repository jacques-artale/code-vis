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

describe('Declarations', () => {
  test('Declare variable', () => {
    const code = 'var a = 1;';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toEqual([['a', 1]]);
  });

  test('Array declaration', () => {
    const code = 'var a = [1, 2, 3];';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(arrayVariables).toEqual([['a', [1, 2, 3]]]);
  });

  test('Object declaration', () => {
    const code = 'var a = {b: 1, c: 2};';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toEqual([['a', {b: 1, c: 2}]]);
  });
});

describe('Array access', () => {
  test('Array access', () => {
    const code = 'var a = [1, 2, 3]; var b = a[0];';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(arrayVariables).toEqual([['a', [1, 2, 3]]]);
    expect(variables).toEqual([['b', 1]]);
  });

  test('Two-dimensional array access', () => {
    const code = 'var a = [[1, 2, 3], [4, 5, 6]]; var b = a[1][1];';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(arrayVariables).toEqual([['a', [[1, 2, 3], [4, 5, 6]]]]);
    expect(variables).toEqual([['b', 5]]);
  });

  test('Three-dimensional array access', () => {
    const code = 'var a = [[[1, 2, 3], [4, 5, 6]], [[7, 8, 9], [10, 11, 12]]]; var b = a[1][1][1];';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(arrayVariables).toEqual([['a', [[[1, 2, 3], [4, 5, 6]], [[7, 8, 9], [10, 11, 12]]]]]);
    expect(variables).toEqual([['b', 11]]);
  });

  test('Array access with variable', () => {
    const code = 'var a = [1, 2, 3]; var b = 1; var c = a[b];';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();    
    expect(variables).toEqual([['b', 1], ['c', 2]]);
  });

  test('Array access of function call', () => {
    const code = 'function a() { return [1, 2, 3]; } var b = a()[1];';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();    
    expect(variables).toEqual([['b', 2]]);
  });

  test('Array access of function call with variable', () => {
    const code = 'function a() { return [1, 2, 3]; } var b = 1; var c = a()[b];';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();    
    expect(variables).toEqual([['b', 1], ['c', 2]]);
  });
});

describe('Object access', () => {
  test('Object property access', () => {
    const code = 'var a = {b: 1}; var c = a.b;';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toContainEqual(['a', {b: 1}]);
    expect(variables).toContainEqual(['c', 1]);
  });

  test('Array access of object', () => {
    const code = 'var a = {b: [1,2,3]}; var c = a.b[1];';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toContainEqual(['a', {b: [1, 2, 3]}]);
    expect(variables).toContainEqual(['c', 2]);
  });

  test('Multidimensional array access of object property', () => {
    const code = 'var a = {b: [[1, 2, 3], [4, 5, 6]]}; var c = a.b[1][1];';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toContainEqual(['a', {b: [[1, 2, 3], [4, 5, 6]]}]);
    expect(variables).toContainEqual(['c', 5]);
  });

  test('Object access of object property', () => {
    const code = 'var a = {b: {c: 1}}; var d = a.b.c;';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toContainEqual(['a', {b: {c: 1}}]);
    expect(variables).toContainEqual(['d', 1]);
  });
});

describe('Variable assignment', () => {  
  test('Arithmetic operations assignment to variable', () => {
    const operations = [
      { code: 'var a = 1 + 2;', expected: [['a', 3]] },
      { code: 'var a = 1 - 2;', expected: [['a', -1]] },
      { code: 'var a = 1 * 2;', expected: [['a', 2]] },
      { code: 'var a = 1 / 2;', expected: [['a', 0.5]] },
      { code: 'var a = 1 % 2;', expected: [['a', 1]] },
      { code: 'var a = (1 + 2) * 3 / 4 % 5;', expected: [['a', 2.25]] },
    ]
    operations.forEach(({ code, expected }) => {
      variables = [];

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
      expect(variables).toEqual(expected);
    });
  });

  test('Assign unary expression to variable', () => {
    const code = 'var a = -1;';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toEqual([['a', -1]]);
  });

  test('Assign variable to variable', () => {
    const code = 'var a = 1; var b = a;';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toContainEqual(['a', 1]);
    expect(variables).toContainEqual(['b', 1]);
  });

  test('Arithmetic operations of variables assignment to variable', () => {
    const operations = [
      { code: 'var a = 1; var b = a;', expected: [['a', 1], ['b', 1]] },
      { code: 'var a = 1; var b = 2; var c = a + b;', expected: [['a', 1], ['b', 2], ['c', 3]] },
      { code: 'var a = 1; var b = 2; var c = a - b;', expected: [['a', 1], ['b', 2], ['c', -1]] },
      { code: 'var a = 1; var b = 2; var c = a * b;', expected: [['a', 1], ['b', 2], ['c', 2]] },
      { code: 'var a = 1; var b = 2; var c = a / b;', expected: [['a', 1], ['b', 2], ['c', 0.5]] },
      { code: 'var a = 1; var b = 2; var c = a % b;', expected: [['a', 1], ['b', 2], ['c', 1]] },
      { code: 'var a = 1; var b = 2; var c = (a + b) * 3 / 4 % b;', expected: [['a', 1], ['b', 2], ['c', 0.25]] },
    ]
    operations.forEach(({ code, expected }) => {
      variables = [];

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
      expect(variables).toEqual(expected);
    });
  });

  test('Assign function call to variable', () => {
    const code = 'function a() { return 1; } var b = a();';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toEqual([['b', 1]]);
  });

  test('Assign object property to variable', () => {
    const code = 'var a = {b: 1}; var c = a.b;';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toContainEqual(['a', {b: 1}]);
    expect(variables).toContainEqual(['c', 1]);
  });

  test('Assign array to variable', () => {});   // TODO: Implement
  test('Assign object to variable', () => {});  // TODO: Implement
});

describe('Array assignment', () => {
  test('Arithmetic operations assignment to array', () => {
    const operations = [
      { code: 'var a = [1, 2, 3]; a[0] = 1 + 2;', expected: [['a', [3, 2, 3]]] },
      { code: 'var a = [1, 2, 3]; a[0] = 1 - 2;', expected: [['a', [-1, 2, 3]]] },
      { code: 'var a = [1, 2, 3]; a[0] = 1 * 2;', expected: [['a', [2, 2, 3]]] },
      { code: 'var a = [1, 2, 3]; a[0] = 1 / 2;', expected: [['a', [0.5, 2, 3]]] },
      { code: 'var a = [1, 2, 3]; a[0] = 1 % 2;', expected: [['a', [1, 2, 3]]] },
      { code: 'var a = [1, 2, 3]; a[0] = (1 + 2) * 3 / 4 % 5;', expected: [['a', [2.25, 2, 3]]] },
    ]
    operations.forEach(({ code, expected }) => {
      arrayVariables = [];

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
      expect(arrayVariables).toEqual(expected);
    });
  });

  test('Assign unary expression to array', () => {
    const code = 'var a = [1, 2, 3]; a[0] = -1;';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(arrayVariables).toEqual([['a', [-1, 2, 3]]]);
  });

  test('Assign variable to array', () => {
    const code = 'var a = 1; var b = [3, 3, 3]; b[0] = a;';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(arrayVariables).toEqual([['b', [1, 3, 3]]]);
  });

  test('Assign function call to array', () => {
    const code = 'function a() { return 1; } var b = [3, 3, 3]; b[0] = a();';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(arrayVariables).toEqual([['b', [1, 3, 3]]]);
  });

  test('Assign array to array', () => {
    const code = 'var a = [1, 2, 3]; var b = [4, 5, 6]; a[0] = b;';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(arrayVariables).toEqual([['a', [[4, 5, 6], 2, 3]], ['b', [4, 5, 6]]]);
  });

  test('Assign value to multidimensional array', () => {
    const code = 'var a = [[1, 2, 3], [4, 5, 6]]; a[1][1] = 7;';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(arrayVariables).toContainEqual(['a', [[1, 2, 3], [4, 7, 6]]]);
  });
});

describe('Object assignment', () => {
  test('Assign function call to object', () => {
    const code = 'function a() { return {b: 1}; } var c = a();';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toEqual([['c', {b: 1}]]);
  });

  test('Assign value to object property', () => {
    const code = 'var a = {b: 1}; a.b = 2;';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toEqual([['a', {b: 2}]]);
  });

  test('Assign object variable to object', () => {
    const code = 'var a = {b: 1}; var c = a;';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toContainEqual(['a', {b: 1}]);
    expect(variables).toContainEqual(['c', {b: 1}]);
  });

  test('Assign variable to object property', () => {
    const code = 'var a = 1; var b = {c: 2}; b.c = a;';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toEqual([['a', 1], ['b', {c: 1}]]);
  });

  test('Assign array to object property', () => {
    const code = 'var a = [1, 2, 3]; var b = {c: 2}; b.c = a;';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(arrayVariables).toEqual([['a', [1, 2, 3]]]);
    expect(variables).toEqual([['b', {c: [1, 2, 3]}]]);
  });

  test('Assign object to object property', () => {
    const code = 'var a = {b: 1}; var c = {d: 2}; c.d = a;';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toEqual([['a', {b: 1}], ['c', {d: {b: 1}}]]);
  });

  test('Assign function call to object property', () => {
    const code = 'function a() { return 1; } var b = {c: 2}; b.c = a();';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toEqual([['b', {c: 1}]]);
  });

  test('Assign value to multidimensional object', () => {
    const code = 'var a = {b: {c: 1}}; a.b.c = 2;';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toContainEqual(['a', {b: {c: 2}}]);
  });
});

describe('Function call', () => {
  test('Function call', () => {
    const code = 'function a() { return 1; } var b = a();';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toEqual([['b', 1]]);
  });

  test('Function call with argument', () => {
    const code = 'function a(b) { return b; } var c = a(1);';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toEqual([['c', 1]]);
  });

  test('Function call with multiple arguments', () => {
    const code = 'function a(b, c) { return b + c; } var d = a(1, 2);';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();
    expect(variables).toContainEqual(['d', 3]);
  });

  test('Function call to standard library functions', () => {
    const code = [
      { code: 'console.log("Hello world");', expected: ['Hello world'] },
      { code: 'console.log(1);', expected: [1] },
      { code: 'var a = [1,2,3,4]; var i = 1; console.log(a[i]);', expected: [2] },
      { code: 'var a = [1,2,3,4]; var i = 1; console.log(a[i]++);', expected: [3] },
    ];
    code.forEach(({ code, expected }) => {
      log = [];

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
      expect(log).toEqual(expected);
    });
  });
});

describe('Update', () => {
  test('Update variable', () => {
    const operations = [
      { code: 'var a = 1; a++;', expected: [['a', 2]] },
      { code: 'var a = 1; a--;', expected: [['a', 0]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
      expect(variables).toEqual(expected);
    });
  });

  test('Update array member', () => {
    const operations = [
      { code: 'var a = [1, 2, 3]; a[0]++;', expected: [['a', [2, 2, 3]]] },
      { code: 'var a = [1, 2, 3]; a[0]--;', expected: [['a', [0, 2, 3]]] },
    ];
    operations.forEach(({ code, expected }) => {
      arrayVariables = [];

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
      expect(arrayVariables).toEqual(expected);
    });
  });

  test('Update object property', () => {
    const operations = [
      { code: 'var a = {b: 1}; a.b++;', expected: [['a', {b: 2}]] },
      { code: 'var a = {b: 1}; a.b--;', expected: [['a', {b: 0}]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
      expect(variables).toEqual(expected);
    });
  });

  test('Update two-dimensional array member', () => {
    const operations = [
      { code: 'var a = [[1, 2, 3], [4, 5, 6]]; a[1][1]++;', expected: [['a', [[1, 2, 3], [4, 6, 6]]]] },
      { code: 'var a = [[1, 2, 3], [4, 5, 6]]; a[1][1]--;', expected: [['a', [[1, 2, 3], [4, 4, 6]]]] },
    ];
    operations.forEach(({ code, expected }) => {
      arrayVariables = [];

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
      expect(arrayVariables).toEqual(expected);
    });
  });

  test('Update two-dimensional array member with variable', () => {
    const operations = [
      { code: 'var a = [[1, 2, 3], [4, 5, 6]]; var b = 1; a[b][1]++;', expVars: [['b', 1]], expArrVars: [['a', [[1, 2, 3], [4, 6, 6]]]] },
      { code: 'var a = [[1, 2, 3], [4, 5, 6]]; var b = 1; a[b][1]--;', expVars: [['b', 1]], expArrVars: [['a', [[1, 2, 3], [4, 4, 6]]]] },
    ];
    operations.forEach(({ code, expVars, expArrVars }) => {
      variables = [];
      arrayVariables = [];

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
      expVars.forEach(([name, value]) => {
        expect(variables).toContainEqual([name, value]);
      });
      expect(arrayVariables).toEqual(expArrVars);
    });
  });

  test('Update two-dimensional object property', () => {
    const operations = [
      { code: 'var a = {b: {c: 1}}; a.b.c++;', expected: [['a', {b: {c: 2}}]] },
      { code: 'var a = {b: {c: 1}}; a.b.c--;', expected: [['a', {b: {c: 0}}]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
      expect(variables).toEqual(expected);
    });
  });

  test('Update three-dimensional array member', () => {
    const operations = [
      { code: 'var a = [[[1,2,3],[4,5,6]], [[7,8,9],[10,11,12]]]; a[1][1][1]++;', expected: [['a', [[[1,2,3], [4,5,6]], [[7,8,9], [10,12,12]]]]] },
      { code: 'var a = [[[1,2,3],[4,5,6]], [[7,8,9],[10,11,12]]]; a[1][1][1]--;', expected: [['a', [[[1,2,3], [4,5,6]], [[7,8,9], [10,10,12]]]]] },
    ];
    operations.forEach(({ code, expected }) => {
      arrayVariables = [];

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
      expect(arrayVariables).toEqual(expected);
    });
  });

  test('Update three-dimensional object property', () => {
    const operations = [
      { code: 'var a = {b: {c: {d: 1}}}; a.b.c.d++;', expected: [['a', {b: {c: {d: 2}}}]] },
      { code: 'var a = {b: {c: {d: 1}}}; a.b.c.d--;', expected: [['a', {b: {c: {d: 0}}}]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
      expect(variables).toEqual(expected);
    });
  });

  test('Update array member with variable', () => {
    const operations = [
      { code: 'var a = [1,2,3]; var b = 0; a[b]++;', expVars: [['b', 0]], expArrVars: [['a', [2,2,3]]] },
      { code: 'var a = [1,2,3]; var b = 0; a[b]--;', expVars: [['b', 0]], expArrVars: [['a', [0,2,3]]] },
      { code: 'var a = [[1,2,3],[4,5,6]]; var b = 1; var c = 1; a[b][c]++;', expVars: [['b', 1], ['c', 1]], expArrVars: [['a', [[1,2,3],[4,6,6]]]] },
      { code: 'var a = [[1,2,3],[4,5,6]]; var b = 1; var c = 1; a[b][c]--;', expVars: [['b', 1], ['c', 1]], expArrVars: [['a', [[1,2,3],[4,4,6]]]] },
      { code: 'var a = [[[1,2,3],[4,5,6]], [[7,8,9],[10,11,12]]]; var b = 1; var c = 1; var d = 1; a[b][c][d]++;', expVars: [['b', 1], ['c', 1], ['d', 1]], expArrVars: [['a', [[[1,2,3],[4,5,6]], [[7,8,9],[10,12,12]]]]] },
      { code: 'var a = [[[1,2,3],[4,5,6]], [[7,8,9],[10,11,12]]]; var b = 1; var c = 1; var d = 1; a[b][c][d]--;', expVars: [['b', 1], ['c', 1], ['d', 1]], expArrVars: [['a', [[[1,2,3],[4,5,6]], [[7,8,9],[10,10,12]]]]] },
    ];
    operations.forEach(({ code, expVars, expArrVars }) => {
      variables = [];
      arrayVariables = [];

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
      expect(variables).toEqual(expVars);
      expect(arrayVariables).toEqual(expArrVars);
    });
  });

  test('Update object property with variable', () => {
    const operations = [
      { code: 'var a = {b: 1}; var c = "b"; a[c]++;', expVars: [['c', 'b'], ['a', {b: 2}]] },
      { code: 'var a = {b: 1}; var c = "b"; a[c]--;', expVars: [['c', 'b'], ['a', {b: 0}]] },
      { code: 'var a = {b: {c: 1}}; var d = "b"; var e = "c"; a[d][e]++;', expVars: [['d', 'b'], ['e', 'c'], ['a', {b: {c: 2}}]] },
      { code: 'var a = {b: {c: 1}}; var d = "b"; var e = "c"; a[d][e]--;', expVars: [['d', 'b'], ['e', 'c'], ['a', {b: {c: 0}}]] },
    ];
    operations.forEach(({ code, expVars }) => {
      variables = [];
      arrayVariables = [];

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
      expVars.forEach(([name, value]) => {
        expect(variables).toContainEqual([name, value]);
      });
    });
  });
});

describe('if statement', () => {
  test('if condition boolean', () => {
    const operations = [
      { code: 'var a = 0; if (true) { a = 1; }', expected: [['a', 1]] },
      { code: 'var a = 0; if (false) { a = 1; }', expected: [['a', 0]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
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

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
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

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
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

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
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

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
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

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();

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
  
      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
  
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
  
      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
  
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
  
      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
  
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
  
      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
  
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
  
      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
  
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
  
      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
  
      expect(variables).toEqual(expected);
    });
  });
});

describe('While statement', () => {
  test('while condition with boolean variable', () => {
    const operations = [
      { code: 'var a = true; while (a) { a = false; }', expected: [['a', false]] },
      { code: 'var a = false; while (a) { a = true; }', expected: [['a', false]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
  
      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
  
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
  
      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
  
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
  
      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
  
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
  
      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
  
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
  
      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
  
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
  
      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
  
      expect(variables).toEqual(expected);
    });
  });
});

describe('For statement', () => {});
describe('Do-while statement', () => {});
describe('Switch statement', () => {});

describe('Scope', () => {});

describe('Error handling', () => {});

describe('Full programs', () => {});
