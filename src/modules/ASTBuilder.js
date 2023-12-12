import { parseScript } from 'esprima';

function buildAst(code) {
  const parsedCode = JSON.parse(parseCode(code));
  return parsedCode;
}

function parseCode(code) {
  try {
    const parsedCode = parseScript(code);
    return JSON.stringify(parsedCode, null, 2);
  } catch (e) {
    console.log("Error parsing code: ", e);
  }
  return "";
}

export default buildAst;