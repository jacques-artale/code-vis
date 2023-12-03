// https://docs.esprima.org/en/4.0/syntax-tree-format.html#expressions-and-patterns

export class Interpreter {

  variables = null;
  array_variables = null;
  setVariables = null;
  setArrayVariables = null;

  constructor(variables, array_variables, setVariables, setArrayVariables) {
    this.variables = variables;
    this.array_variables = array_variables;
    this.setVariables = setVariables;
    this.setArrayVariables = setArrayVariables;
  }

  /*
    HANDLE SCOPE AND ENVIRONMENT VARIABLES
  */
  createEnvironment() {
    return {
      variables: [],
      array_variables: [],
      parentEnvironment: null,
    };
  }

  lookupVariableValue(name, environment) {
    if (name in environment.variables) {
      return environment.variables[name];
    }
    if (name in environment.array_variables) {
      return environment.array_variables[name];
    }
    if (environment.parentEnvironment !== null) {
      return this.lookupVariableValue(name, environment.parentEnvironment);
    }
    return null;
  }

  createVariable(name, value, environment) {
    // create variable

    // update state variables
  }

  createArrayVariable(name, values, environment) {
    // create array variable

    // update state variables
  }

  updateVariableValue(name, value, environment) {
    // update value

    // update state variables
  }

  updateStateVariables(environment) {

  }

  /*
    INTERPRETATION FUNCTIONS
  */
  interpretParsedCode(parsedCode) {
    console.log(parsedCode);

    for (let i = 0; i < parsedCode.body.length; i++) {
      this.execute_node_type(parsedCode.body[i]);
    }

  }

  execute_node_type(node) {
    switch (node.type) {
      case 'VariableDeclaration':
        return this.interpretVariableDeclaration(node);
      case 'FunctionDeclaration':
        return this.interpretFunctionDeclaration(node);
      case 'BlockStatement':
        return this.interpretBlockStatement(node);
      case 'ExpressionStatement':
        return this.interpretExpressionStatement(node);
      case 'AssignmentExpression':
        return this.interpretAssignmentExpression(node);
      case 'BinaryExpression':
        return this.interpretBinaryExpression(node);
      case 'LogicalExpression':
        return this.interpretLogicalExpression(node);
      case 'UnaryExpression':
        return this.interpretUnaryExpression(node);
      case 'UpdateExpression':
        return this.interpretUpdateExpression(node);
      case 'IfStatement':
        return this.interpretIfStatement(node);
      case 'ForStatement':
        return this.interpretForStatement(node);
      case 'WhileStatement':
        return this.interpretWhileStatement(node);
      case 'DoWhileStatement':
        return this.interpretDoWhileStatement(node);
      case 'ReturnStatement':
        return this.interpretReturnStatement(node);
      case 'CallExpression':
        return this.interpretCallExpression(node);
      case 'MemberExpression':
        return this.interpretMemberExpression(node);
      case 'ConditionalExpression':
        return this.interpretConditionalExpression(node);
      case 'SwitchStatement':
        return this.interpretSwitchStatement(node);
      default:
        console.log('unrecognized node type');
    }
  }

  interpretExpression(node) {
    console.log("expression");
    switch (node.type) {
      case 'Literal':
        return node.value;
      case 'Identifier':
        const var_name = node.name;
        for (let i = 0; i < this.variables.length; i++) {
          if (this.variables[i][0] === var_name) {
            return this.variables[i][1];
          }
        }
        console.error(`Expression interpreter error: Variable ${var_name} not found`);
        break;
      case 'BinaryExpression':
        return this.interpretBinaryExpression(node);
      // Add other expression types as needed
      default:
        console.error(`Unrecognized node type: ${node.type}`);
    }
  }

  evaluateBinaryExpression(left, right, operator) {
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
      case '==':
        return left == right;
      case '===':
        return left === right;
      case '!=':
        return left != right;
      case '!==':
        return left !== right;
      case '<':
        return left < right;
      case '<=':
        return left <= right;
      case '>':
        return left > right;
      case '>=':
        return left >= right;
      case '&&':
        return left && right;
      case '||':
        return left || right;
      case '<<':
        return left << right;
      case '>>':
        return left >> right;
      case '>>>':
        return left >>> right;
      case '&':
        return left & right;
      case '|':
        return left | right;
      case '^':
        return left ^ right;
      case 'in':
        return left in right;
      // Add other operators as needed, possibly power operator and such
      default:
        console.error(`Unrecognized operator: ${operator}`);
    }
  }



  interpretExpressionStatement(node) {
    console.log("expression statement");
    console.log(node);

    switch (node.expression.type) {
      case 'AssignmentExpression':
        return this.interpretAssignmentExpression(node);
      case 'BinaryExpression':
        return this.interpretBinaryExpression(node);
      // Add other expression types as needed
      default:
        console.log('expression type not implemented yet');
    }
  }

  interpretAssignmentExpression(node) {
    console.log("assignment expression");
    console.log(node);

    const var_name = node.expression.left.name;
    const value = this.interpretExpression(node.expression.right);

    const index = this.variables.findIndex(([name]) => name === var_name);
    if (index === -1) {
      console.log("weird error, variable not found");
      return;
    }

    const new_variables = [...this.variables];
    new_variables[index] = [var_name, value];
    this.setVariables(new_variables);
  }

  interpretBinaryExpression(node) {
    console.log("binary expression");
    console.log(node);

    const left_value = this.interpretExpression(node.left);
    const right_value = this.interpretExpression(node.right);
    const operator = node.operator;

    const result = this.evaluateBinaryExpression(left_value, right_value, operator);
    
    return result;
  }

  interpretLogicalExpression() {}
  interpretUnaryExpression() {}
  interpretUpdateExpression() {}
  interpretCallExpression() {}
  interpretMemberExpression() {}
  interpretConditionalExpression() {}

  interpretVariableDeclaration() {}
  interpretFunctionDeclaration() {}

  interpretBlockStatement(node) {
    console.log("block statement");

    for (let i = 0; i < node.body.length; i++) {
      this.execute_node_type(node.body[i]);
    }
  }

  interpretIfStatement(node) {
    console.log("if statement");
    console.log(node);

    // interpret the conditional expression
    const test = this.interpretExpression(node.test);
    // interpret the consequent if the conditional expression is true
    if (test) {
      console.log("test is true");
      this.interpretBlockStatement(node.consequent);
    }
  }

  interpretForStatement(node) {
    console.log("for statement");
    console.log(node);

    // enter a new environment

    // setup variables in the for loop
    this.interpretVariableDeclaration(node.init);

    // interpret the conditional expression

    // while the conditional expression is true, interpret the body of the for loop

    // interpret the update expression
  }

  interpretWhileStatement() {}
  interpretDoWhileStatement() {}
  interpretSwitchStatement() {}
  interpretReturnStatement() {}

}
