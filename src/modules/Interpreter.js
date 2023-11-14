// https://docs.esprima.org/en/4.0/syntax-tree-format.html#expressions-and-patterns


// fun problems I need to solve:
// 1. how to handle variable scope
//   - var/let/const
//   - block scope (for loops, if statements, etc)


function interpretParsedCode(parsedCode, variables, setVariables, array_variables, setArrayVariables) {
  console.log(parsedCode);

  for (let i = 0; i < parsedCode.body.length; i++) {
    execute_node_type(parsedCode.body[i], variables, setVariables, array_variables, setArrayVariables);
  }

}

function execute_node_type(node, variables, setVariables, array_variables, setArrayVariables) {
  switch (node.type) {
    case 'VariableDeclaration':
      return interpretVariableDeclaration(node);
    case 'FunctionDeclaration':
      return interpretFunctionDeclaration(node);
    case 'BlockStatement':
      return interpretBlockStatement(node);
    case 'ExpressionStatement':
      return interpretExpressionStatement(node, variables, setVariables);
    case 'AssignmentExpression':
      return interpretAssignmentExpression(node, variables, setVariables);
    case 'BinaryExpression':
      return interpretBinaryExpression(node);
    case 'LogicalExpression':
      return interpretLogicalExpression(node);
    case 'UnaryExpression':
      return interpretUnaryExpression(node);
    case 'UpdateExpression':
      return interpretUpdateExpression(node);
    case 'IfStatement':
      return interpretIfStatement(node);
    case 'ForStatement':
      return interpretForStatement(node);
    case 'WhileStatement':
      return interpretWhileStatement(node);
    case 'DoWhileStatement':
      return interpretDoWhileStatement(node);
    case 'ReturnStatement':
      return interpretReturnStatement(node);
    case 'CallExpression':
      return interpretCallExpression(node);
    case 'MemberExpression':
      return interpretMemberExpression(node);
    case 'ConditionalExpression':
      return interpretConditionalExpression(node);
    case 'SwitchStatement':
      return interpretSwitchStatement(node);
    default:
      console.log('unrecognized node type');
  }
}

function interpretExpression(node, variables) {
  console.log("expression");
  switch (node.type) {
    case 'Literal':
      return node.value;
    case 'Identifier':
      const var_name = node.name;
      for (let i = 0; i < variables.length; i++) {
        if (variables[i][0] === var_name) {
          return variables[i][1];
        }
      }
      console.error(`Expression interpreter error: Variable ${var_name} not found`);
      break;
    case 'BinaryExpression':
      console.log("found binary expression");
      return interpretBinaryExpression(node, variables);
    // Add other expression types as needed
    default:
      console.error(`Unrecognized node type: ${node.type}`);
  }
}

function evaluateBinaryExpression(left, right, operator) {
  switch (operator) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    case '/':
      return left / right;
    case '%':
      return left % right;
    // Add other operators as needed, possibly power operator and such
    default:
      console.error(`Unrecognized operator: ${operator}`);
  }
}



function interpretExpressionStatement(node, variables, setVariables) {
  console.log("expression statement");
  console.log(node);

  switch (node.expression.type) {
    case 'AssignmentExpression':
      return interpretAssignmentExpression(node, variables, setVariables);
    case 'BinaryExpression':
      return interpretBinaryExpression(node, variables, setVariables);
    // Add other expression types as needed
    default:
      console.log('expression type not implemented yet');
  }
}

function interpretAssignmentExpression(node, variables, setVariables) {
  console.log("assignment expression");
  console.log(node);

  const var_name = node.expression.left.name;
  const value = interpretExpression(node.expression.right, variables);

  const index = variables.findIndex(([name]) => name === var_name);
  if (index === -1) {
    console.log("weird error, variable not found");
    return;
  }

  const new_variables = [...variables];
  new_variables[index] = [var_name, value];
  setVariables(new_variables);
}

function interpretBinaryExpression(node, variables) {
  console.log("binary expression");
  console.log(node);

  const left_value = interpretExpression(node.left, variables);
  const right_value = interpretExpression(node.right, variables);
  const operator = node.operator;

  const result = evaluateBinaryExpression(left_value, right_value, operator);
  
  return result;
}

function interpretLogicalExpression() {}
function interpretUnaryExpression() {}
function interpretUpdateExpression() {}
function interpretCallExpression() {}
function interpretMemberExpression() {}
function interpretConditionalExpression() {}

function interpretVariableDeclaration() {}
function interpretFunctionDeclaration() {}

function interpretBlockStatement() {}
function interpretIfStatement() {}
function interpretForStatement() {}
function interpretWhileStatement() {}
function interpretDoWhileStatement() {}
function interpretSwitchStatement() {}
function interpretReturnStatement() {}


export default interpretParsedCode;