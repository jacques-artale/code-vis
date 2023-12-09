import build_ast from '../src/modules/ASTBuilder';
import { Interpreter } from '../src/modules/Interpreter';

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
beforeEach(() => {    
  variables = [];
  array_variables = [];
  log = [];
  parsedCode = '';

  interpreter = new Interpreter(setVariables, setArrayVariables, setLog);
});

describe('Declarations', () => {
  test('Declare variable', () => {
    const code = 'var a = 1;';
    build_ast(code, setParsedCode);
    interpreter.interpretParsedCode(parsedCode);
    expect(variables).toEqual([['a', 1]]);
  });

  test('Array declaration', () => {
    const code = 'var a = [1, 2, 3];';
    build_ast(code, setParsedCode);
    interpreter.interpretParsedCode(parsedCode);
    expect(array_variables).toEqual([['a', [1, 2, 3]]]);
  });

  test('Object declaration', () => {
    const code = 'var a = {b: 1, c: 2};';
    build_ast(code, setParsedCode);
    interpreter.interpretParsedCode(parsedCode);
    expect(variables).toEqual([['a', {b: 1, c: 2}]]);
  });
});

describe('Variable assignment', () => {  
  test('Assign addition of two values to variable', () => {
    const code = 'var a = 1 + 2;';
    build_ast(code, setParsedCode);
    interpreter.interpretParsedCode(parsedCode);
    expect(variables).toEqual([['a', 3]]);
  });

  test('Assign subtraction of two values to variable', () => {
    const code = 'var a = 1 - 2;';
    build_ast(code, setParsedCode);
    interpreter.interpretParsedCode(parsedCode);
    expect(variables).toEqual([['a', -1]]);
  });

  test('Assign multiplication of two values to variable', () => {
    const code = 'var a = 1 * 2;';
    build_ast(code, setParsedCode);
    interpreter.interpretParsedCode(parsedCode);
    expect(variables).toEqual([['a', 2]]);
  });

  test('Assign division of two values to variable', () => {
    const code = 'var a = 1 / 2;';
    build_ast(code, setParsedCode);
    interpreter.interpretParsedCode(parsedCode);
    expect(variables).toEqual([['a', 0.5]]);
  });

  test('Assign modulo of two values to variable', () => {
    const code = 'var a = 1 % 2;';
    build_ast(code, setParsedCode);
    interpreter.interpretParsedCode(parsedCode);
    expect(variables).toEqual([['a', 1]]);
  });

  test('Assign simple binary expression to variable', () => {
    const code = 'var a = (1 + 2) * 3 / 4 % 5;';
    build_ast(code, setParsedCode);
    interpreter.interpretParsedCode(parsedCode);
    expect(variables).toEqual([['a', 2.25]]);
  });

  test('Assign unary expression to variable', () => {});
  test('Assign literal to variable', () => {});
  test('Assign identifier to variable', () => {});
  test('Assign function call to variable', () => {});

  test('Assign addition of two variables to variable', () => {});
  test('Assign subtraction of two variables to variable', () => {});
  test('Assign multiplication of two variables to variable', () => {});
  test('Assign division of two variables to variable', () => {});
  test('Assign modulo of two variables to variable', () => {});
  test('Assign simple binary expression of two variables to variable', () => {});

  test('Assign array to variable', () => {});
  test('Assign object to variable', () => {});
});

describe('Array assignment', () => {});
describe('Object assignment', () => {});
describe('Function declaration', () => {});
describe('Function call', () => {});
describe('If statement', () => {});
describe('While statement', () => {});
describe('For statement', () => {});
describe('Do-while statement', () => {});
