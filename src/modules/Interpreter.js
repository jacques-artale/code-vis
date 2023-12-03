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
  interpretParsedCode(parsedCode, variables, setVariables, array_variables, setArrayVariables) {
    console.log(parsedCode);

    for (let i = 0; i < parsedCode.body.length; i++) {
      this.execute_node_type(parsedCode.body[i], variables, setVariables, array_variables, setArrayVariables);
    }

  }

  execute_node_type(node, variables, setVariables, array_variables, setArrayVariables) {
    switch (node.type) {
      case 'VariableDeclaration':
        return this.interpretVariableDeclaration(node);
      case 'FunctionDeclaration':
        return this.interpretFunctionDeclaration(node);
      case 'BlockStatement':
        return this.interpretBlockStatement(node);
      case 'ExpressionStatement':
        return this.interpretExpressionStatement(node, variables, setVariables);
      case 'AssignmentExpression':
        return this.interpretAssignmentExpression(node, variables, setVariables);
      case 'BinaryExpression':
        return this.interpretBinaryExpression(node);
      case 'LogicalExpression':
        return this.interpretLogicalExpression(node);
      case 'UnaryExpression':
        return this.interpretUnaryExpression(node);
      case 'UpdateExpression':
        return this.interpretUpdateExpression(node);
      case 'IfStatement':
        return this.interpretIfStatement(node, variables, setVariables, array_variables, setArrayVariables);
      case 'ForStatement':
        return this.interpretForStatement(node, variables, setVariables, array_variables, setArrayVariables);
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

  interpretExpression(node, variables) {
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
        return this.interpretBinaryExpression(node, variables);
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



  interpretExpressionStatement(node, variables, setVariables) {
    console.log("expression statement");
    console.log(node);

    switch (node.expression.type) {
      case 'AssignmentExpression':
        return this.interpretAssignmentExpression(node, variables, setVariables);
      case 'BinaryExpression':
        return this.interpretBinaryExpression(node, variables, setVariables);
      // Add other expression types as needed
      default:
        console.log('expression type not implemented yet');
    }
  }

  interpretAssignmentExpression(node, variables, setVariables) {
    console.log("assignment expression");
    console.log(node);

    const var_name = node.expression.left.name;
    const value = this.interpretExpression(node.expression.right, variables);

    const index = variables.findIndex(([name]) => name === var_name);
    if (index === -1) {
      console.log("weird error, variable not found");
      return;
    }

    const new_variables = [...variables];
    new_variables[index] = [var_name, value];
    setVariables(new_variables);
  }

  interpretBinaryExpression(node, variables) {
    console.log("binary expression");
    console.log(node);

    const left_value = this.interpretExpression(node.left, variables);
    const right_value = this.interpretExpression(node.right, variables);
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

  interpretBlockStatement(node, variables, setVariables, array_variables, setArrayVariables) {
    console.log("block statement");

    for (let i = 0; i < node.body.length; i++) {
      this.execute_node_type(node.body[i], variables, setVariables, array_variables, setArrayVariables);
    }
  }

  interpretIfStatement(node, variables, setVariables, array_variables, setArrayVariables) {
    console.log("if statement");
    console.log(node);

    // interpret the conditional expression
    const test = this.interpretExpression(node.test, variables);
    // interpret the consequent if the conditional expression is true
    if (test) {
      console.log("test is true");
      this.interpretBlockStatement(node.consequent, variables, setVariables, array_variables, setArrayVariables);
    }
  }

  interpretForStatement(node, variables, setVariables, array_variables, setArrayVariables) {
    console.log("for statement");
    console.log(node);

    // enter a new environment

    // setup variables in the for loop
    this.interpretVariableDeclaration(node.init, variables, setVariables);

    // interpret the conditional expression

    // while the conditional expression is true, interpret the body of the for loop

    // interpret the update expression
  }

  interpretWhileStatement() {}
  interpretDoWhileStatement() {}
  interpretSwitchStatement() {}
  interpretReturnStatement() {}

}
