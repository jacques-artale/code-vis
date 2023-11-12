// https://docs.esprima.org/en/4.0/syntax-tree-format.html#expressions-and-patterns


// fun problems I need to solve:
// 1. how to handle variable scope
//   - var/let/const
//   - block scope (for loops, if statements, etc)


function interpretParsedCode(parsedCode) {
  console.log(parsedCode);


  // for each node in the parsed code
  // call execute_node_type(node)
  // return the result of the last node

  for (let i = 0; i < parsedCode.body.length; i++) {
    execute_node_type(parsedCode.body[i]);
  }

}



function execute_node_type(node) {
  switch (node.type) {
    case 'VariableDeclaration':
      return interpretVariableDeclaration(node);
    case 'FunctionDeclaration':
      return interpretFunctionDeclaration(node);
    case 'BlockStatement':
      return interpretBlockStatement(node);
    case 'ExpressionStatement':
      return interpretExpressionStatement(node);
    case 'AssignmentExpression':
      return interpretAssignmentExpression(node);
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

function interpretVariableDeclaration() {
  
}

function interpretFunctionDeclaration() {
  
}

function interpretBlockStatement() {
  
}

function interpretExpressionStatement() {
  
}

function interpretAssignmentExpression() {
  
}

function interpretBinaryExpression() {
  
}

function interpretLogicalExpression() {
  
}

function interpretUnaryExpression() {
  
}

function interpretUpdateExpression() {
  
}

function interpretIfStatement() {
  
}

function interpretForStatement() {
  
}

function interpretWhileStatement() {
  
}

function interpretDoWhileStatement() {
  
}

function interpretReturnStatement() {
  
}

function interpretCallExpression() {
  
}

function interpretMemberExpression() {
  
}

function interpretConditionalExpression() {
  
}

function interpretSwitchStatement() {

}


export default interpretParsedCode;