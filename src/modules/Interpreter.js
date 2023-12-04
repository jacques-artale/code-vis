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
  createEnvironment(parent) {
    return {
      variables: [],
      array_variables: [],
      parentEnvironment: parent,
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
    if (name in environment.variables) return;
    environment.variables[name] = value;

    this.updateStateVariables(environment);
  }

  createArrayVariable(name, values, environment) {
    if (name in environment.array_variables) return;
    environment.array_variables[name] = values;

    this.updateStateVariables(environment);
  }

  updateVariableValue(name, value, environment) {
    // find and update the variable in the environment
    let current_environment = environment;
    while (current_environment !== null) {
      if (name in current_environment.variables) {
        current_environment.variables[name] = value;
        break;
      }
      if (name in current_environment.array_variables) {
        current_environment.array_variables[name] = value;
        break;
      }
      current_environment = current_environment.parentEnvironment;
    }

    this.updateStateVariables(environment);
  }

  updateStateVariables(environment) {
    // add all variables from the environment to the state variables
    // do so for all parent environments as well
    const new_variables = [];
    const new_array_variables = [];

    let current_environment = environment;
    while (current_environment !== null) {
      for (const [name, value] of Object.entries(current_environment.variables)) {
        new_variables.push([name, value]);
      }
      for (const [name, values] of Object.entries(current_environment.array_variables)) {
        new_array_variables.push([name, values]);
      }
      current_environment = current_environment.parentEnvironment;
    }

    this.setVariables(new_variables);
    this.setArrayVariables(new_array_variables);
  }

  /*
    INTERPRETATION FUNCTIONS
  */
  interpretParsedCode(parsedCode) {
    console.log(parsedCode);

    // create the global environment
    const environment = this.createEnvironment(null);

    for (let i = 0; i < parsedCode.body.length; i++) {
      this.execute_node_type(parsedCode.body[i], environment);
    }

  }

  execute_node_type(node, environment) {
    switch (node.type) {
      case 'VariableDeclaration':
        return this.interpretVariableDeclaration(node, environment);
      case 'FunctionDeclaration':
        return this.interpretFunctionDeclaration(node);
      case 'BlockStatement':
        return this.interpretBlockStatement(node, environment);
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
        return this.interpretIfStatement(node, environment);
      case 'ForStatement':
        return this.interpretForStatement(node, environment);
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

  interpretVariableDeclaration(node, environment) {
    console.log("variable declaration");
    console.log(node);

    for (let i = 0; i < node.declarations.length; i++) {
      const declaration = node.declarations[i];
      const var_name = declaration.id.name;
      const var_val = this.interpretExpression(declaration.init);

      this.createVariable(var_name, var_val, environment);
    }
  }

  interpretFunctionDeclaration() {}

  interpretBlockStatement(node, environment) {
    console.log("block statement");

    for (let i = 0; i < node.body.length; i++) {
      this.execute_node_type(node.body[i], environment);
    }
  }

  interpretIfStatement(node, environment) {
    console.log("if statement");
    console.log(node);

    // interpret the conditional expression
    const test = this.interpretExpression(node.test);
    // interpret the consequent if the conditional expression is true
    if (test) {
      console.log("test is true");
      this.interpretBlockStatement(node.consequent, environment);
    }
  }

  interpretForStatement(node, environment) {
    console.log("for statement");
    console.log(node);

    // enter a new environment
    const new_scope = this.createEnvironment(environment);

    // setup variables in the for loop
    this.interpretVariableDeclaration(node.init, new_scope);

    // interpret the conditional expression
    // while the conditional expression is true, interpret the body of the for loop

    // interpret the update expression

    // exit the environment
    this.updateStateVariables(environment);
  }

  interpretWhileStatement() {}
  interpretDoWhileStatement() {}
  interpretSwitchStatement() {}
  interpretReturnStatement() {}

}
