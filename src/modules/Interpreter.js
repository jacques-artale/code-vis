// https://docs.esprima.org/en/4.0/syntax-tree-format.html#expressions-and-patterns

export class Interpreter {

  debugging = false;

  globalEnvironment = null;

  functionDeclarations = [];

  constructor() {
    this.globalEnvironment = this.createEnvironment(null);
  }

  clearInternalState() {
    this.globalEnvironment = this.createEnvironment(null);
    this.functionDeclarations = [];
  }

  /*
    HANDLE SCOPE AND ENVIRONMENT VARIABLES
  */
  createEnvironment(parent) {
    return {
      variables: [],
      arrayVariables: [],
      objectVariables: [],
      parentEnvironment: parent,
      returnValue: null,
    };
  }

  createFunction(name, parameters, body) {
    return {
      name: name,
      parameters: parameters,
      body: body,
    };
  }

  lookupFunction(name) {
    for (let i = 0; i < this.functionDeclarations.length; i++) {
      if (this.functionDeclarations[i].name === name) {
        return this.functionDeclarations[i];
      }
    }
    console.error(`Expression interpreter error: Function ${name} not found`);
    return null;
  }

  createVariable(name, value, environment) {
    if (name in environment.variables) return;
    environment.variables[name] = value;

    this.updateStateVariables(environment);
  }

  createArrayVariable(name, values, environment) {
    if (name in environment.arrayVariables) return;
    environment.arrayVariables[name] = values;

    this.updateStateVariables(environment);
  }

  createObjectVariable(name, value, environment) {
    if (name in environment.objectVariables) return;
    environment.objectVariables[name] = value;

    this.updateStateVariables(environment);
  }

  lookupVariableValue(name, environment) {
    if (name in environment.variables) {
      return environment.variables[name];
    }
    if (name in environment.arrayVariables) {
      return environment.arrayVariables[name];
    }
    if (name in environment.objectVariables) {
      return environment.objectVariables[name];
    }
    if (environment.parentEnvironment !== null) {
      return this.lookupVariableValue(name, environment.parentEnvironment);
    }
    console.error(`Expression interpreter error: Variable ${name} not found`);
    return null;
  }

  updateVariableValue(name, value, environment) {
    // find and update the variable in the environment
    let currentEnvironment = environment;
    while (currentEnvironment !== null) {
      if (name in currentEnvironment.variables) {
        currentEnvironment.variables[name] = value;
        break;
      }
      if (name in currentEnvironment.arrayVariables) {
        currentEnvironment.arrayVariables[name] = value;
        break;
      }
      if (name in currentEnvironment.objectVariables) {
        currentEnvironment.objectVariables[name] = value;
        break;
      }
      currentEnvironment = currentEnvironment.parentEnvironment;
    }

    this.updateStateVariables(environment);
  }

  updateVariableProperty(name, property, value, environment) {
    // find and update the variable in the environment
    let currentEnvironment = environment;
    while (currentEnvironment !== null) {
      if (name in currentEnvironment.arrayVariables) {
        currentEnvironment.arrayVariables[name][property] = value;
        break;
      }
      if (name in currentEnvironment.objectVariables) {
        currentEnvironment.objectVariables[name][property] = value;
        break;
      }
      currentEnvironment = currentEnvironment.parentEnvironment;
    }

    this.updateStateVariables(environment);
  }

  updateStateVariables(environment) {
    // add all variables from the environment to the state variables
    // do so for all parent environments as well
    const newVariables = [];
    const newArrayVariables = [];

    let currentEnvironment = environment;
    while (currentEnvironment !== null) {
      // add all variables from the environment to the state variables
      for (const [name, value] of Object.entries(currentEnvironment.variables)) {
        newVariables.push([name, value]);
      }
      // add all array variables from the environment to the state variables
      for (const [name, values] of Object.entries(currentEnvironment.arrayVariables)) {
        newArrayVariables.push([name, values]);
      }
      // add all object variables from the environment to the state variables
      for (const [name, properties] of Object.entries(currentEnvironment.objectVariables)) {
        newVariables.push([name, properties]);
      }
      currentEnvironment = currentEnvironment.parentEnvironment;
    }

    postMessage({ command: 'updateVariables', variables: newVariables, arrayVariables: newArrayVariables });
  }

  /*
    INTERPRETATION FUNCTIONS
  */
  interpretParsedCode(parsedCode) {
    if (this.debugging) console.log(parsedCode);

    // create the global environment
    const environment = this.globalEnvironment;

    for (let i = 0; i < parsedCode.body.length; i++) {
      this.executeNodeType(parsedCode.body[i], environment);
    }
  }

  executeNodeType(node, environment) {
    switch (node.type) {
      case 'VariableDeclaration':
        return this.interpretVariableDeclaration(node, environment);
      case 'FunctionDeclaration':
        return this.interpretFunctionDeclaration(node);
      case 'BlockStatement':
        return this.interpretBlockStatement(node, environment);
      case 'ExpressionStatement':
        return this.interpretExpressionStatement(node, environment);
      case 'AssignmentExpression':
        return this.interpretAssignmentExpression(node, environment);
      case 'BinaryExpression':
        return this.interpretBinaryExpression(node, environment);
      case 'LogicalExpression':
        return this.interpretLogicalExpression(node);
      case 'UnaryExpression':
        return this.interpretUnaryExpression(node, environment);
      case 'UpdateExpression':
        return this.interpretUpdateExpression(node, environment);
      case 'IfStatement':
        return this.interpretIfStatement(node, environment);
      case 'ForStatement':
        return this.interpretForStatement(node, environment);
      case 'WhileStatement':
        return this.interpretWhileStatement(node, environment);
      case 'DoWhileStatement':
        return this.interpretDoWhileStatement(node, environment);
      case 'ReturnStatement':
        return this.interpretReturnStatement(node, environment);
      case 'CallExpression':
        return this.interpretCallExpression(node, environment);
      case 'MemberExpression':
        return this.interpretMemberExpression(node, environment);
      case 'ConditionalExpression':
        return this.interpretConditionalExpression(node);
      case 'SwitchStatement':
        return this.interpretSwitchStatement(node, environment);
      default:
        console.log('unrecognized node type');
    }
  }

  interpretExpression(node, environment) {
    if (this.debugging) console.log("expression");
    if (this.debugging) console.log(node);
    if (node === null) return null;

    switch (node.type) {
      case 'Literal':
        return node.value;
      case 'Identifier':
        return this.lookupVariableValue(node.name, environment);
      case 'BinaryExpression':
        return this.interpretBinaryExpression(node, environment);
      case 'LogicalExpression':
        return this.interpretLogicalExpression(node);
      case 'UnaryExpression':
        return this.interpretUnaryExpression(node, environment);
      case 'ArrayExpression':
        return this.interpretArrayExpression(node, environment);
      case 'ObjectExpression':
        return this.interpretObjectExpression(node, environment);
      case 'CallExpression':
        return this.interpretCallExpression(node, environment);
      case 'MemberExpression':
        return this.interpretMemberExpression(node, environment);
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

  interpretExpressionStatement(node, environment) {
    if (this.debugging) console.log("expression statement");
    if (this.debugging) console.log(node);

    switch (node.expression.type) {
      case 'AssignmentExpression':
        return this.interpretAssignmentExpression(node, environment);
      case 'BinaryExpression':
        return this.interpretBinaryExpression(node, environment);
      case 'UpdateExpression':
        return this.interpretUpdateExpression(node.expression, environment);
      case 'CallExpression':
        return this.interpretCallExpression(node.expression, environment);
      case 'MemberExpression':
        return this.interpretMemberExpression(node.expression, environment);
      // Add other expression types as needed
      default:
        console.log('expression type not implemented yet');
    }
  }

  interpretAssignmentExpression(node, environment) {
    if (this.debugging) console.log("assignment expression");
    if (this.debugging) console.log(node);

    // check if the assignment is to an object property
    if (node.expression.left.type === 'MemberExpression') {
      // we update the property
      this.handleMemberExpressionAssignment(node, environment);
    } else {
      // we update the variable
      this.handleVariableAssignment(node, environment);
    }
  }

  handleMemberExpressionAssignment(node, environment) {
    const identifier = node.expression.left.object.name;
    const operator = node.expression.operator;

    const property = this.interpretExpression(node.expression.left.property, environment);

    const oldValue = this.lookupVariableValue(identifier, environment)[property];
    const value = this.interpretExpression(node.expression.right, environment);

    let newValue = null;
    if (operator === "=") newValue = value;
    else if (operator === "+=") newValue = oldValue + value;
    else if (operator === "-=") newValue = oldValue - value;
    else if (operator === "*=") newValue = oldValue * value;
    else if (operator === "/=") newValue = oldValue / value;
    else if (operator === "%=") newValue = oldValue % value;
    else if (operator === "<<=") newValue = oldValue << value;
    else if (operator === ">>=") newValue = oldValue >> value;
    else if (operator === ">>>=") newValue = oldValue >>> value;
    else if (operator === "&=") newValue = oldValue & value;
    else if (operator === "|=") newValue = oldValue | value;
    else if (operator === "^=") newValue = oldValue ^ value;
    else {
      console.error("unknown operator: " + operator);
    }

    this.updateVariableProperty(identifier, property, newValue, environment); // identifier[property] = value;
  }

  handleVariableAssignment(node, environment) {
    const varName = node.expression.left.name;
    const value = this.interpretExpression(node.expression.right, environment);
    const operator = node.expression.operator;

    const oldValue = this.lookupVariableValue(varName, environment);
    let newValue = null;

    if (operator === "=") newValue = value;
    else if (operator === "+=") newValue = oldValue + value;
    else if (operator === "-=") newValue = oldValue - value;
    else if (operator === "*=") newValue = oldValue * value;
    else if (operator === "/=") newValue = oldValue / value;
    else if (operator === "%=") newValue = oldValue % value;
    else if (operator === "<<=") newValue = oldValue << value;
    else if (operator === ">>=") newValue = oldValue >> value;
    else if (operator === ">>>=") newValue = oldValue >>> value;
    else if (operator === "&=") newValue = oldValue & value;
    else if (operator === "|=") newValue = oldValue | value;
    else if (operator === "^=") newValue = oldValue ^ value;
    else {
      console.error("unknown operator: " + operator);
    }
    
    this.updateVariableValue(varName, newValue, environment);
  }

  interpretBinaryExpression(node, environment) {
    if (this.debugging) console.log("binary expression");
    if (this.debugging) console.log(node);

    const leftValue = this.interpretExpression(node.left, environment);
    const rightValue = this.interpretExpression(node.right, environment);
    const operator = node.operator;

    const result = this.evaluateBinaryExpression(leftValue, rightValue, operator);
    
    return result;
  }

  interpretLogicalExpression() {}

  interpretUnaryExpression(node, environment) {
    if (this.debugging) console.log("unary expression");
    if (this.debugging) console.log(node);

    const value = this.interpretExpression(node.argument, environment);
    const operator = node.operator;

    if (operator === "!") return !value;
    else if (operator === "-") return -value;
    else if (operator === "+") return +value;
    else if (operator === "~") return ~value;
    else if (operator === "typeof") return typeof value;
    else if (operator === "void") return void value;
    else {
      console.error("unknown operator: " + operator);
    }
  }

  interpretUpdateExpression(node, environment) {
    if (this.debugging) console.log("update expression");
    if (this.debugging) console.log(node);

    if (node.argument.type === 'MemberExpression') {
      // update the array or object property
      this.handleUpdateMemberExpression(node, environment);
    } else {
      // update the variable
      this.handleUpdateVariableExpression(node, environment);
    }
  }

  handleUpdateMemberExpression(node, environment) {
    const identifier = node.argument.object.name;
    const operator = node.operator;
    const property = this.interpretExpression(node.argument.property, environment);

    let value = this.lookupVariableValue(identifier, environment)[property];
    if (operator === "++") value++;
    else if (operator === "--") value--;
    else console.error("weird error, operator not found");

    this.updateVariableProperty(identifier, property, value, environment); // identifier[property] = value;
  }

  handleUpdateVariableExpression(node, environment) {
    const varName = node.argument.name;
    const operator = node.operator;
    let value = this.lookupVariableValue(varName, environment);

    if (operator === "++") value++;
    else if (operator === "--") value--;
    else console.error("weird error, operator not found");

    this.updateVariableValue(varName, value, environment);
  }

  interpretCallExpression(node, environment) {
    if (this.debugging) console.log("call expression");
    if (this.debugging) console.log(node);
    
    // check if the function is a built-in function
    if (this.handleStandardFunctions(node, environment)) return;

    // fetch the values of each argument
    const callArguments = node.arguments;
    const argumentValues = [];
    for (let i = 0; i < callArguments.length; i++) {
      argumentValues.push(this.interpretExpression(callArguments[i], environment));
    }

    // fetch the function declaration
    const functionDeclaration = this.lookupFunction(node.callee.name);

    // create a new environment for the function
    const newEnvironment = this.createEnvironment(this.globalEnvironment);

    // add the parameters to the environment (new variables with values of callArguments)
    for (let i = 0; i < functionDeclaration.parameters.length; i++) {
      const parameter = functionDeclaration.parameters[i];
      const parameterValue = argumentValues[i];
      this.createVariable(parameter.name, parameterValue, newEnvironment);
    }

    // interpret the body of the function
    this.interpretBlockStatement(functionDeclaration.body, newEnvironment);

    // exit the environment
    this.updateStateVariables(environment);

    // return the return value of the function (if any)
    return newEnvironment.returnValue;
  }

  handleStandardFunctions(node, environment) {
    if (node.callee.type === 'MemberExpression') {
      if (node.callee.object.name === 'console') {
        if (node.callee.property.name === 'log') {
          this.interpretConsoleLog(node, environment);
          return true;
        }
      }
    }
    return false;
  }

  interpretMemberExpression(node, environment) {
    if (this.debugging) console.log("member expression");
    if (this.debugging) console.log(node);

    const object = this.interpretExpression(node.object, environment);
    const property = this.interpretExpression(node.property, environment);

    return object[property];
  }

  interpretConditionalExpression() {}

  interpretObjectExpression(node, environment) {
    if (this.debugging) console.log("object expression");
    if (this.debugging) console.log(node);

    const properties = node.properties;

    // create the new object
    const object = {};
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      const key = property.key.name;
      const value = this.interpretExpression(property.value, environment);
      object[key] = value;
    }

    return object;
  }

  interpretArrayExpression(node, environment) {
    if (this.debugging) console.log("array expression");
    if (this.debugging) console.log(node);

    const values = [];
    for (let i = 0; i < node.elements.length; i++) {
      values.push(this.interpretExpression(node.elements[i], environment));
    }

    return values;
  }

  interpretVariableDeclaration(node, environment) {
    if (this.debugging) console.log("variable declaration");
    if (this.debugging) console.log(node);

    for (let i = 0; i < node.declarations.length; i++) {
      const declaration = node.declarations[i];
      const varName = declaration.id.name;
      const varVal = this.interpretExpression(declaration.init, environment);
      const varType = declaration.init.type;

      if (varType === 'Literal') {                                   // variable is a literal
        this.createVariable(varName, varVal, environment);
      } else if (varType === 'Identifier') {                         // variable is an identifier
        const value = this.lookupVariableValue(declaration.init.name, environment);
        this.createVariable(varName, value, environment);
      } else if (varType === 'BinaryExpression') {                   // variable is a binary expression
        const value = this.interpretExpression(declaration.init, environment);
        this.createVariable(varName, value, environment);
      } else if (varType === 'UnaryExpression') {                    // variable is a unary expression
        const value = this.interpretExpression(declaration.init, environment);
        this.createVariable(varName, value, environment);
      } else if (varType === 'CallExpression') {                     // variable is a function call
        const value = this.interpretExpression(declaration.init, environment);
        this.createVariable(varName, value, environment);
      } else if (varType === 'ArrayExpression') {                    // variable is an array
        this.createArrayVariable(varName, varVal, environment);
      } else if (varType === 'ObjectExpression') {                   // variable is an object
        this.createObjectVariable(varName, varVal, environment);
      } else if (varType === 'MemberExpression') {                   // variable is an array or object property
        // check type of value and create the variable accordingly
        if (Array.isArray(varVal)) {
          this.createArrayVariable(varName, varVal, environment);
        } else if (typeof varVal === 'object') {
          this.createObjectVariable(varName, varVal, environment);
        } else {
          this.createVariable(varName, varVal, environment);
        }
      } else {
        console.error("unknown variable type: " + declaration.init.type);
      }
    }
  }

  interpretFunctionDeclaration(node) {
    if (this.debugging) console.log("function declaration");
    if (this.debugging) console.log(node);

    const name = node.id.name;
    const parameters = node.params;
    const body = node.body;

    const functionDeclaration = this.createFunction(name, parameters, body);

    this.functionDeclarations.push(functionDeclaration);
  }

  interpretBlockStatement(node, environment) {
    if (this.debugging) console.log("block statement");

    for (let i = 0; i < node.body.length; i++) {
      this.executeNodeType(node.body[i], environment);
    }
  }

  interpretIfStatement(node, environment) {
    if (this.debugging) console.log("if statement");
    if (this.debugging) console.log(node);

    // interpret the conditional expression
    const test = this.interpretExpression(node.test, environment);
    // interpret the consequent if the conditional expression is true
    if (test) {
      if (this.debugging) console.log("test is true");
      this.interpretBlockStatement(node.consequent, environment);
    }
  }

  interpretForStatement(node, environment) {
    if (this.debugging) console.log("for statement");
    if (this.debugging) console.log(node);

    const newScope = this.createEnvironment(environment);      // enter a new environment
    this.interpretVariableDeclaration(node.init, newScope);    // setup variables in the for loop

    // interpret the conditional expression
    while (this.interpretExpression(node.test, newScope)) {
      this.interpretBlockStatement(node.body, newScope);       // interpret the body of the for loop
      this.interpretUpdateExpression(node.update, newScope);   // interpret the update expression
    }

    // exit the environment
    this.updateStateVariables(environment);
  }

  interpretWhileStatement(node, environment) {
    if (this.debugging) console.log("while statement");
    if (this.debugging) console.log(node);

    const newScope = this.createEnvironment(environment);      // enter a new environment

    // interpret the conditional expression
    while (this.interpretExpression(node.test, newScope)) {
      this.interpretBlockStatement(node.body, newScope);       // interpret the body of the for loop
    }

    // exit the environment
    this.updateStateVariables(environment);
  }

  interpretDoWhileStatement(node, environment) {
    if (this.debugging) console.log("do while statement");
    if (this.debugging) console.log(node);

    const newScope = this.createEnvironment(environment);      // enter a new environment

    // interpret the iteration
    do {
      this.interpretBlockStatement(node.body, newScope);       // interpret the body of the for loop
    } while (this.interpretExpression(node.test, newScope));

    // exit the environment
    this.updateStateVariables(environment);
  }

  interpretSwitchStatement(node, environment) {
    if (this.debugging) console.log("switch statement");
    if (this.debugging) console.log(node);

    const newScope = this.createEnvironment(environment);      // enter a new environment

    const value = this.interpretExpression(node.discriminant, newScope);

    for (let i = 0; i < node.cases.length; i++) {
      const caseNode = node.cases[i];
      const test = this.interpretExpression(caseNode.test, newScope);

      if (test === null || test === value) {  // if the test is null, it is the default case
        // interpret the body of the case
        for (let i = 0; i < caseNode.consequent.length; i++) {
          this.executeNodeType(caseNode.consequent[i], newScope);
        }
        break;
      }
    }

    // exit the environment
    this.updateStateVariables(environment);
  }

  interpretReturnStatement(node, environment) {
    if (this.debugging) console.log("return statement");
    if (this.debugging) console.log(node);

    environment.returnValue = this.interpretExpression(node.argument, environment);
  }

  /* STANDARD FUNCTIONS */

  interpretConsoleLog(node, environment) {
    if (this.debugging) console.log("console log");
    if (this.debugging) console.log(node);

    const argument = this.interpretExpression(node.arguments[0], environment);
    postMessage({ command: 'consoleLog', argument: argument });
  }

}
