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
      { code: 'var a = [1,2,3,4]; var i = 1; console.log(a[i]++);', expected: [2] },
      { code: 'var a = [1,2,3,4]; var i = 1; console.log(++a[i]);', expected: [3] },
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

  test('Update variable in arithmetic expression', () => {
    const operations = [
      { code: 'var a = 1; var b = 2; a = b++;', expected: [['a', 2], ['b', 3]] },
      { code: 'var a = 1; var b = 2; a = b--;', expected: [['a', 2], ['b', 1]] },
      { code: 'var a = 1; var b = 2; a = ++b;', expected: [['a', 3], ['b', 3]] },
      { code: 'var a = 1; var b = 2; a = --b;', expected: [['a', 1], ['b', 1]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();

      expect(variables).toEqual(expected);
    });
  });

  test('Update array member in arithmetic expression', () => {
    const operations = [
      { code: 'var a = [1,2,3]; var b = a[0]++;', expArr: [['a', [2,2,3]]], expVar: [['b', 1]] },
      { code: 'var a = [1,2,3]; var b = a[0]--;', expArr: [['a', [0,2,3]]], expVar: [['b', 1]] },
      { code: 'var a = [1,2,3]; var b = ++a[0];', expArr: [['a', [2,2,3]]], expVar: [['b', 2]] },
      { code: 'var a = [1,2,3]; var b = --a[0];', expArr: [['a', [0,2,3]]], expVar: [['b', 0]] },
    ];
    operations.forEach(({ code, expArr, expVar }) => {
      variables = [];
      arrayVariables = [];

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();

      expect(arrayVariables).toEqual(expArr);
      expect(variables).toEqual(expVar);
    });
  });

  test('Update object property in arithmetic expression', () => {
    const operations = [
      { code: 'var a = {b: 1}; var c = a.b++;', expected: [['a', {b: 2}],['c', 1]] },
      { code: 'var a = {b: 1}; var c = a.b--;', expected: [['a', {b: 0}],['c', 1]] },
      { code: 'var a = {b: 1}; var c = ++a.b;', expected: [['a', {b: 2}],['c', 2]] },
      { code: 'var a = {b: 1}; var c = --a.b;', expected: [['a', {b: 0}],['c', 0]] },
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

  test('nested while', () => {
    const operations = [
      { code: 'var c = 0; var a = 0; while (a < 10) { var b = 0; while (b < 10) { c++; b++; } a++; }', expected: [['c', 100],['a', 10]] },
      { code: 'var c = 0; var a = 0; while (a < 10) { var b = 0; while (b < 5) { c++; b++; } a++; }', expected: [['c', 50],['a', 10]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
  
      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();

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
  
      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();

      expect(variables).toEqual(expected);
    });
  });
});

describe('For statement', () => {
  test('for basic update', () => {
    const operations = [
      { code: 'var a = 0; for (var i = 0; i < 10; i++) { a++; }', expected: [['a', 10]] },
      { code: 'var a = 10; for (var i = 10; i > 0; i--) { a--; }', expected: [['a', 0]] }
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
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
      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
      expect(variables).toEqual(expected);
    });
  });

  test('nested for', () => {
    const operations = [
      { code: 'var a = 0; for (var i = 0; i < 5; i++) { for (var j = 0; j < 5; j++) { a++; } }', expected: [['a', 25]] }
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
      expect(variables).toEqual(expected);
    });
  });

  test('for multiple variable declaration', () => {
    const operations = [
      { code: 'var a = 0; var b = 10; for (var i = 0, j = 10; i < j; i++, j--) { a++; b--; }', expected: [['a', 5], ['b', 5]] }
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
      expect(variables).toEqual(expected);
    });
  });

  test('for condition with arithmetic operation', () => {
    const operations = [
      { code: 'var a = 0; for (var i = 0; i < 10 * 2; i++) { a++; }', expected: [['a', 20]] }
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
      expect(variables).toEqual(expected);
    });
  });

  test('for condition with boolean operation', () => {
    const operations = [
      { code: 'var a = 0; for (var i = 0; i < 10 && a < 5; i++) { a++; }', expected: [['a', 5]] }
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];
      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
      expect(variables).toEqual(expected);
    });
  });

  test('for condition with array member access', () => {
    const operations = [
      { code: 'var a = [1, 2, 3, 4, 5]; var sum = 0; for (var i = 0; i < a[2]; i++) { sum += i; }', expected: [['sum', 3]] }
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

describe('Do-while statement', () => {
  test('do-while condition with boolean variable', () => {
    const operations = [
      { code: 'var a = 0; var b = true; do { a = 1; b = false; } while (b);', expected: [['a', 1], ['b', false]] },
      { code: 'var a = 0; var b = false; do { a = 1; b = true; } while (!b);', expected: [['a', 1], ['b', true]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();

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

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();

      expect(arrayVariables).toEqual(expArrVars);
      expect(variables).toEqual(expVars);
    });
  });

  test('do-while condition with function call', () => {
    const code = 'var count = 0; var cond = true; function a() { return cond; } do { count++; cond = false; } while (a());';
    const parsedCode = buildAst(code).code;
    const interpreter = new Interpreter(parsedCode, updateVariables);
    interpreter.interpretAllInstructions();

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

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();

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

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();

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

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();

      expect(variables).toEqual(expected);
    });
  });
});

describe('Switch statement', () => {
  test('switch with different cases', () => {
    const operations = [
      { code: 'var a = 1; switch(a) { case 1: a++; break; case 2: a--; break; default: a = 0; }', expected: [['a', 2]] },
      { code: 'var a = 2; switch(a) { case 1: a++; break; case 2: a--; break; default: a = 0; }', expected: [['a', 1]] },
      { code: 'var a = 3; switch(a) { case 1: a++; break; case 2: a--; break; default: a = 0; }', expected: [['a', 0]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();

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

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();

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

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();

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

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();

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

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();

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

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();

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

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();

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

      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();

      expect(variables).toEqual(expected);      
    });
  });
});

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
  
      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();

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
  
      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
  
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
  
      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
  
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
  
      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
  
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
  
      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
  
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
  
      const parsedCode = buildAst(code).code;
      const interpreter = new Interpreter(parsedCode, updateVariables);
      interpreter.interpretAllInstructions();
  
      expect(variables).toEqual(expected);
    });
  });
});

describe('continue', () => {});

describe('Scope', () => {});

describe('Error handling', () => {});

describe('Full programs', () => {});
