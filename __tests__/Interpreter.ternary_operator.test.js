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

describe('Ternary operator', () => {
  test('Ternary operator with true condition', () => {
    const code = 'var a = true ? 20 : 30;';
    interpret(code);
    expect(variables).toEqual([['a', 20]]);
  });

  test('Ternary operator with false condition', () => {
    const code = 'var a = false ? 20 : 30;';
    interpret(code);
    expect(variables).toEqual([['a', 30]]);
  });

  test('Ternary operator with variable condition', () => {
    const code = 'var a = true; var b = a ? 20 : 30;';
    interpret(code);
    expect(variables).toEqual([['a', true], ['b', 20]]);
  });

  test('Ternary operator with binary expression condition', () => {
    const operations = [
      { code: 'var a = 5 < 10 ? 10 : 20;', expected: [['a', 10]] },
      { code: 'var a = 5 > 10 ? 10 : 20;', expected: [['a', 20]] },
      { code: 'var a = 5 <= 10 ? 10 : 20;', expected: [['a', 10]] },
      { code: 'var a = 5 >= 10 ? 10 : 20;', expected: [['a', 20]] },
      { code: 'var a = 5 === 10 ? 10 : 20;', expected: [['a', 20]] },
      { code: 'var a = 5 !== 10 ? 10 : 20;', expected: [['a', 10]] },
    ]
    operations.forEach(({ code, expected }) => {
      variables = [];

      interpret(code);
      expect(variables).toEqual(expected);
    });
  });

  test('Nested ternary operator', () => {
    const code = 'var a = true ? false ? 10 : 20 : 30;';
    interpret(code);
    expect(variables).toEqual([['a', 20]]);
  });
});
