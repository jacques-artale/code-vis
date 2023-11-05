import { parseScript } from 'esprima';

function parse_code(code) {

  try {
    const parsedCode = parseScript(code);
    return JSON.stringify(parsedCode, null, 2);
  } catch (e) {
    console.log("Error parsing code: ", e);
  }

  return "";
}

export default parse_code;