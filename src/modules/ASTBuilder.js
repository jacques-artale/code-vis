import { parseScript } from 'esprima';

function build_ast(code, setParsedCode, setVariables, setArrayVariables) {
  const parsedCode = JSON.parse(parse_code(code));
  setParsedCode(parsedCode);

  const variables = get_variables(parsedCode);
  setVariables(variables);

  const array_variables = get_array_variables(parsedCode);
  setArrayVariables(array_variables);
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

function get_variables(parsedCode) {
  console.log(parsedCode);
  const variables = [];
  for (const node of parsedCode.body) {
    if (node.type === "VariableDeclaration") {
      for (const declaration of node.declarations) {
        if (declaration.init.type === "Literal") {
          variables.push([declaration.id.name, declaration.init.value]);
        }
      }
    }
  }
  return variables;
}

function get_array_variables(parsedCode) {
  console.log(parsedCode);
  const array_variables = [];
  for (const node of parsedCode.body) {
    if (node.type === "VariableDeclaration") {
      for (const declaration of node.declarations) {
        if (declaration.init.type === "ArrayExpression") {
          array_variables.push([declaration.id.name, declaration.init.elements.map(element => {
            // Nested array
            if (element.type === "ArrayExpression") {
              return element.elements.map(element => {
                return element.value
              });
            }
            // Single value
            return element.value
          })]);
        }
      }
    }
  }
  return array_variables;
}

export default build_ast;