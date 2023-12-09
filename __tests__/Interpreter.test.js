import build_ast from '../src/modules/ASTBuilder';
import { Interpreter } from '../src/modules/Interpreter';

describe('Interpreter', () => {

  let variables = [];
  let array_variables = [];
  let log = [];
  let parsedCode = '';

  const setVariables = (new_variables) => { variables = new_variables; };
  const setArrayVariables = (new_array_variables) => { array_variables = new_array_variables; };
  const setLog = (new_log) => { log = new_log; };
  const setParsedCode = (new_parsedCode) => { parsedCode = new_parsedCode; };

  let interpreter;

  // Reset variables before each test
  beforeAll(() => {
    variables = [];
    array_variables = [];
    log = [];
    parsedCode = '';

    interpreter = new Interpreter(setVariables, setArrayVariables, setLog);
  });

  test('Variable declaration', () => {
    const code = 'var a = 1;';
    build_ast(code, setParsedCode);
    interpreter.interpretParsedCode(parsedCode);

    expect(variables).toEqual([['a', 1]]);
  });
});
