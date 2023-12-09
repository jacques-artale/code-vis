import { parseScript } from 'esprima';

function build_ast(code) {
  const parsedCode = JSON.parse(parse_code(code));
  return parsedCode;
}

function parse_code(code) {
  try {
    const parsedCode = parseScript(code);
    return JSON.stringify(parsedCode, null, 2);
  } catch (e) {
    console.log("Error parsing code: ", e);
  }
  return "";
}

export default build_ast;