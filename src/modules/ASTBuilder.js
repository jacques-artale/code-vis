import { parseScript } from 'esprima';

function buildAst(code) {
  try {
    const ast = parseScript(code);
    return { type: 'parsed', code: ast};
  } catch (e) {
    console.log("Error parsing code: ", e);
    return { type: 'error', description: e.description, line: e.lineNumber, column: e.column };
  }
}

export default buildAst;