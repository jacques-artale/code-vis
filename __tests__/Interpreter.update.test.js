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

describe('Update', () => {
  test('Update variable', () => {
    const operations = [
      { code: 'var a = 1; a++;', expected: [['a', 2]] },
      { code: 'var a = 1; a--;', expected: [['a', 0]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];

      interpret(code);
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

      interpret(code);
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

      interpret(code);
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

      interpret(code);
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

      interpret(code);
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

      interpret(code);
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

      interpret(code);
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

      interpret(code);
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

      interpret(code);
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

      interpret(code);
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

      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('Update array member in arithmetic expression', () => { // ISSUE WITH GOTONEXT
    const operations = [
      { code: 'var a = [1,2,3]; var b = a[0]++;', expArr: [['a', [2,2,3]]], expVar: [['b', 1]] },
      { code: 'var a = [1,2,3]; var b = a[0]--;', expArr: [['a', [0,2,3]]], expVar: [['b', 1]] },
      { code: 'var a = [1,2,3]; var b = ++a[0];', expArr: [['a', [2,2,3]]], expVar: [['b', 2]] },
      { code: 'var a = [1,2,3]; var b = --a[0];', expArr: [['a', [0,2,3]]], expVar: [['b', 0]] },
    ];
    operations.forEach(({ code, expArr, expVar }) => {
      variables = [];
      arrayVariables = [];

      interpret(code);
      expect(arrayVariables).toEqual(expArr);
      expect(variables).toEqual(expVar);
    });
  });

  test('Update object property in arithmetic expression', () => { // ISSUE WITH GOTONEXT
    const operations = [
      { code: 'var a = {b: 1}; var c = a.b++;', expected: [['a', {b: 2}],['c', 1]] },
      { code: 'var a = {b: 1}; var c = a.b--;', expected: [['a', {b: 0}],['c', 1]] },
      { code: 'var a = {b: 1}; var c = ++a.b;', expected: [['a', {b: 2}],['c', 2]] },
      { code: 'var a = {b: 1}; var c = --a.b;', expected: [['a', {b: 0}],['c', 0]] },
    ];
    operations.forEach(({ code, expected }) => {
      variables = [];

      interpret(code);
      expected.forEach(([name, value]) => {
        expect(variables).toContainEqual([name, value]);
      });
    });
  });
});
