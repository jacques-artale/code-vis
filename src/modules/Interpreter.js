// https://docs.esprima.org/en/4.0/syntax-tree-format.html#expressions-and-patterns

export class Interpreter {

  debugging = false;

  updateCallback = null;
  globalEnvironment = null;
  functionDeclarations = [];

  parsedCode = null;
  nextExecutingNode = 0;

  environmentStack = [];

  // TODO: keep track of call stack (where do executeNodeType returns go?)

  constructor(parsedCode, updateCallback) {
    this.parsedCode = parsedCode;
    this.updateCallback = updateCallback;

    this.globalEnvironment = this.createEnvironment(null);
    this.environmentStack.push(this.globalEnvironment);
  }

  clearInternalState() {
    this.globalEnvironment = this.createEnvironment(null);
    this.functionDeclarations = [];
    this.nextExecutingNode = 0;
    this.environmentStack = [];
    this.environmentStack.push(this.globalEnvironment);
  }

  setParsedCode(parsedCode) {
    this.parsedCode = parsedCode;
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

  getCurrentEnvironment() {
    return this.environmentStack[this.environmentStack.length - 1];
  }

  addNewEnvironment(environment) {
    this.environmentStack.push(environment);
  }

  removeCurrentEnvironment() {
    this.environmentStack.pop();
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
    if (this.debugging) console.error(`Expression interpreter error: Function ${name} not found`);
    return null;
  }

  createVariable(name, value) {
    const environment = this.getCurrentEnvironment();
    if (name in environment.variables) return;
    environment.variables[name] = value;

    this.updateStateVariables(environment);
  }

  createArrayVariable(name, values) {
    const environment = this.getCurrentEnvironment();
    if (name in environment.arrayVariables) return;
    environment.arrayVariables[name] = values;

    this.updateStateVariables(environment);
  }

  createObjectVariable(name, value) {
    const environment = this.getCurrentEnvironment();
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
    if (this.debugging) console.error(`Expression interpreter error: Variable ${name} not found`);
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

  updateVariableProperty(name, properties, value, environment) {
    // find and update the variable in the environment
    let currentEnvironment = environment;
    while (currentEnvironment !== null) {
      if (name in currentEnvironment.arrayVariables) {
        let variable = currentEnvironment.arrayVariables[name];
        for (let i = 0; i < properties.length - 1; i++) {
          variable = variable[properties[i]];
        }
        variable[properties[properties.length - 1]] = value;
        break;
      }
      if (name in currentEnvironment.objectVariables) {
        let variable = currentEnvironment.objectVariables[name];
        for (let i = 0; i < properties.length - 1; i++) {
          variable = variable[properties[i]];
        }
        variable[properties[properties.length - 1]] = value;
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

    this.updateCallback({ command: 'updateVariables', variables: newVariables, arrayVariables: newArrayVariables });
  }

  /*
    INTERPRETATION FUNCTIONS
  */
  interpretAllInstructions() {
    if (this.debugging) console.log(this.parsedCode);

    for (let i = 0; i < this.parsedCode.body.length; i++) {
      this.executeNodeType(this.parsedCode.body[i]);
    }
  }

  interpretNextInstruction() {
    const node = this.getExecutingNode();
    if (node === null) return;

    this.executeNodeType(node);
    this.nextExecutingNode++;
  }

  getExecutingNode() {
    if (this.nextExecutingNode >= this.parsedCode.body.length) return null;
    return this.parsedCode.body[this.nextExecutingNode];
  }

  executeNodeType(node) {
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
    if (this.debugging) console.log("expression");
    if (this.debugging) console.log(node);
    if (node === null) return null;

    switch (node.type) {
      case 'Literal':
        return node.value;
      case 'Identifier':
        return this.lookupVariableValue(node.name, this.getCurrentEnvironment());
      case 'BinaryExpression':
        return this.interpretBinaryExpression(node);
      case 'LogicalExpression':
        return this.interpretLogicalExpression(node);
      case 'UnaryExpression':
        return this.interpretUnaryExpression(node);
      case 'ArrayExpression':
        return this.interpretArrayExpression(node);
      case 'ObjectExpression':
        return this.interpretObjectExpression(node);
      case 'CallExpression':
        return this.interpretCallExpression(node);
      case 'MemberExpression':
        return this.interpretMemberExpression(node);
      case 'UpdateExpression':
        return this.interpretUpdateExpression(node);
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
    if (this.debugging) console.log("expression statement");
    if (this.debugging) console.log(node);

    switch (node.expression.type) {
      case 'AssignmentExpression':
        return this.interpretAssignmentExpression(node);
      case 'BinaryExpression':
        return this.interpretBinaryExpression(node);
      case 'UpdateExpression':
        return this.interpretUpdateExpression(node.expression);
      case 'CallExpression':
        return this.interpretCallExpression(node.expression);
      case 'MemberExpression':
        return this.interpretMemberExpression(node.expression);
      // Add other expression types as needed
      default:
        console.log('expression type not implemented yet');
    }
  }

  interpretAssignmentExpression(node) {
    if (this.debugging) console.log("assignment expression");
    if (this.debugging) console.log(node);

    // check if the assignment is to an object property
    if (node.expression.left.type === 'MemberExpression') {
      // we update the property
      this.handleMemberExpressionAssignment(node);
    } else {
      // we update the variable
      this.handleVariableAssignment(node);
    }
  }

  handleMemberExpressionAssignment(node) {
    const leftExpression = node.expression.left;
    const operator = node.expression.operator;

    // get the object we are updating
    let object = leftExpression;
    let properties = [];
    while (object.type === 'MemberExpression') {
      properties.unshift(this.handleMemberProperty(object.property));
      object = object.object;
    }

    // TODO: handle this better as it could be something other than an identifier
    let identifier = null;
    if (object.type === 'Identifier') {
      identifier = object.name;
    }

    // get the current value of the property we are updating
    const objectValue = this.interpretExpression(object);
    let oldValue = objectValue;
    for (let i = 0; i < properties.length; i++) {
      oldValue = oldValue[properties[i]];
    }
    const value = this.interpretExpression(node.expression.right);

    // update
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

    this.updateVariableProperty(identifier, properties, newValue, this.getCurrentEnvironment()); // identifier[property[0]][property[1]][...] = value;
  }

  handleMemberProperty(node) {
    if (node.type === 'Identifier') {
      const value = this.lookupVariableValue(node.name, this.getCurrentEnvironment());
      if (value !== null) return value;
      const functionDeclaration = this.lookupFunction(node.name);
      if (functionDeclaration !== null) return functionDeclaration;
      // if we get here then the identifier must be a property
      return node.name;
    } else {
      return this.interpretExpression(node);
    }
  }

  handleVariableAssignment(node) {
    const varName = node.expression.left.name;
    const value = this.interpretExpression(node.expression.right);
    const operator = node.expression.operator;

    const oldValue = this.lookupVariableValue(varName, this.getCurrentEnvironment());
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
    
    this.updateVariableValue(varName, newValue, this.getCurrentEnvironment());
  }

  interpretBinaryExpression(node) {
    if (this.debugging) console.log("binary expression");
    if (this.debugging) console.log(node);

    const leftValue = this.interpretExpression(node.left);
    const rightValue = this.interpretExpression(node.right);
    const operator = node.operator;

    const result = this.evaluateBinaryExpression(leftValue, rightValue, operator);
    
    return result;
  }

  interpretLogicalExpression(node) {
    if (this.debugging) console.log("logical expression");
    if (this.debugging) console.log(node);

    const leftValue = this.interpretExpression(node.left);
    const rightValue = this.interpretExpression(node.right);
    const operator = node.operator;

    return this.evaluateBinaryExpression(leftValue, rightValue, operator);
  }

  interpretUnaryExpression(node) {
    if (this.debugging) console.log("unary expression");
    if (this.debugging) console.log(node);

    const value = this.interpretExpression(node.argument);
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

  interpretUpdateExpression(node) {
    if (this.debugging) console.log("update expression");
    if (this.debugging) console.log(node);

    if (node.argument.type === 'MemberExpression') {
      // update the array or object property
      return this.handleUpdateMemberExpression(node);
    } else {
      // update the variable
      return this.handleUpdateVariableExpression(node);
    }
  }

  handleUpdateMemberExpression(node) {
    // get the object we are updating
    let object = node.argument;
    let properties = [];
    while (object.type === 'MemberExpression') {
      properties.unshift(this.handleMemberProperty(object.property));
      object = object.object;
    }

    let identifier = null;
    if (object.type === 'Identifier') {
      identifier = object.name;
    }

    const operator = node.operator;

    // get the current value of the property we are updating
    let objectValue = this.lookupVariableValue(identifier, this.getCurrentEnvironment());
    let value = objectValue;
    for (let i = 0; i < properties.length; i++) {
      value = value[properties[i]];
    }

    // update
    if (operator === "++") value++;
    else if (operator === "--") value--;
    else console.error("weird error, operator not found");

    this.updateVariableProperty(identifier, properties, value, this.getCurrentEnvironment()); // identifier[property[0]][property[1]][...] = value;

    return value;
  }

  handleUpdateVariableExpression(node) {
    const varName = node.argument.name;
    const operator = node.operator;
    let value = this.lookupVariableValue(varName, this.getCurrentEnvironment());

    if (operator === "++") value++;
    else if (operator === "--") value--;
    else console.error("weird error, operator not found");

    this.updateVariableValue(varName, value, this.getCurrentEnvironment());

    return value;
  }

  interpretCallExpression(node) {
    if (this.debugging) console.log("call expression");
    if (this.debugging) console.log(node);
    
    // check if the function is a built-in function
    if (this.handleStandardFunctions(node)) return;

    // fetch the values of each argument
    const callArguments = node.arguments;
    const argumentValues = [];
    for (let i = 0; i < callArguments.length; i++) {
      argumentValues.push(this.interpretExpression(callArguments[i]));
    }

    // fetch the function declaration
    const functionDeclaration = this.lookupFunction(node.callee.name);

    // create a new environment for the function
    const newEnvironment = this.createEnvironment(this.globalEnvironment);
    this.addNewEnvironment(newEnvironment);

    // add the parameters to the environment (new variables with values of callArguments)
    for (let i = 0; i < functionDeclaration.parameters.length; i++) {
      const parameter = functionDeclaration.parameters[i];
      const parameterValue = argumentValues[i];
      this.createVariable(parameter.name, parameterValue);
    }

    // interpret the body of the function
    this.interpretBlockStatement(functionDeclaration.body);

    // exit the environment
    this.removeCurrentEnvironment();

    // update the state variables to that of the parent environment
    this.updateStateVariables(this.getCurrentEnvironment());

    // return the return value of the function (if any)
    return newEnvironment.returnValue;
  }

  handleStandardFunctions(node) {
    if (node.callee.type === 'MemberExpression') {
      if (node.callee.object.name === 'console') {
        if (node.callee.property.name === 'log') {
          this.interpretConsoleLog(node);
          return true;
        }
      }
    }
    return false;
  }

  interpretMemberExpression(node) {
    if (this.debugging) console.log("member expression");
    if (this.debugging) console.log(node);

    const object = this.interpretExpression(node.object);
    const property = this.handleMemberProperty(node.property);

    return object[property];
  }

  interpretConditionalExpression() {}

  interpretObjectExpression(node) {
    if (this.debugging) console.log("object expression");
    if (this.debugging) console.log(node);

    const properties = node.properties;

    // create the new object
    const object = {};
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      const key = property.key.name;
      const value = this.interpretExpression(property.value);
      object[key] = value;
    }

    return object;
  }

  interpretArrayExpression(node) {
    if (this.debugging) console.log("array expression");
    if (this.debugging) console.log(node);

    const values = [];
    for (let i = 0; i < node.elements.length; i++) {
      values.push(this.interpretExpression(node.elements[i]));
    }

    return values;
  }

  interpretVariableDeclaration(node) {
    if (this.debugging) console.log("variable declaration");
    if (this.debugging) console.log(node);

    for (let i = 0; i < node.declarations.length; i++) {
      const declaration = node.declarations[i];
      const varName = declaration.id.name;
      const varVal = this.interpretExpression(declaration.init);
      const varType = declaration.init.type;

      if (varType === 'Literal') {                                   // variable is a literal
        this.createVariable(varName, varVal);
      } else if (varType === 'Identifier') {                         // variable is an identifier
        const value = this.lookupVariableValue(declaration.init.name, this.getCurrentEnvironment());
        this.createVariable(varName, value);
      } else if (varType === 'BinaryExpression') {                   // variable is a binary expression
        const value = this.interpretExpression(declaration.init);
        this.createVariable(varName, value);
      } else if (varType === 'UnaryExpression') {                    // variable is a unary expression
        const value = this.interpretExpression(declaration.init);
        this.createVariable(varName, value);
      } else if (varType === 'CallExpression') {                     // variable is a function call
        const value = this.interpretExpression(declaration.init);
        this.createVariable(varName, value);
      } else if (varType === 'ArrayExpression') {                    // variable is an array
        this.createArrayVariable(varName, varVal);
      } else if (varType === 'ObjectExpression') {                   // variable is an object
        this.createObjectVariable(varName, varVal);
      } else if (varType === 'MemberExpression') {                   // variable is an array or object property
        // check type of value and create the variable accordingly
        if (Array.isArray(varVal)) {
          this.createArrayVariable(varName, varVal);
        } else if (typeof varVal === 'object') {
          this.createObjectVariable(varName, varVal);
        } else {
          this.createVariable(varName, varVal);
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

  interpretBlockStatement(node) {
    if (this.debugging) console.log("block statement");
    if (this.debugging) console.log(node);

    for (let i = 0; i < node.body.length; i++) {
      this.executeNodeType(node.body[i]);
    }
  }

  interpretIfStatement(node) {
    if (this.debugging) console.log("if statement");
    if (this.debugging) console.log(node);

    // interpret the conditional expression
    const test = this.interpretExpression(node.test);
    // interpret the consequent if the conditional expression is true
    if (test) {
      if (this.debugging) console.log("test is true");

      const newEnvironment = this.createEnvironment(this.getCurrentEnvironment());
      this.addNewEnvironment(newEnvironment); // enter a new environment

      this.interpretBlockStatement(node.consequent);

      this.removeCurrentEnvironment(); // exit the environment
    } else {
      if (this.debugging) console.log("test is false");

      // interpret the alternate if it exists
      if (node.alternate !== null) {
        if (this.debugging) console.log("alternate exists");

        if (node.alternate.type === 'IfStatement') {
          // if else if ...
          this.interpretIfStatement(node.alternate);
        } else {
          // else
          const newEnvironment = this.createEnvironment(this.getCurrentEnvironment());
          this.addNewEnvironment(newEnvironment); // enter a new environment

          this.interpretBlockStatement(node.alternate);

          this.removeCurrentEnvironment(); // exit the environment
        }
      }
    }
  }

  interpretForStatement(node) {
    if (this.debugging) console.log("for statement");
    if (this.debugging) console.log(node);

    const newEnvironment = this.createEnvironment(this.getCurrentEnvironment());      // enter a new environment
    this.addNewEnvironment(newEnvironment);
    this.interpretVariableDeclaration(node.init);    // setup variables in the for loop

    // interpret the conditional expression
    while (this.interpretExpression(node.test)) {
      this.interpretBlockStatement(node.body);       // interpret the body of the for loop
      this.interpretUpdateExpression(node.update);   // interpret the update expression
    }

    // exit the environment
    this.removeCurrentEnvironment();
    this.updateStateVariables(this.getCurrentEnvironment());
  }

  interpretWhileStatement(node) {
    if (this.debugging) console.log("while statement");
    if (this.debugging) console.log(node);

    const newEnvironment = this.createEnvironment(this.getCurrentEnvironment());      // enter a new environment
    this.addNewEnvironment(newEnvironment);

    // interpret the conditional expression
    while (this.interpretExpression(node.test)) {
      this.interpretBlockStatement(node.body);       // interpret the body of the for loop
    }

    // exit the environment
    this.removeCurrentEnvironment();
    this.updateStateVariables(this.getCurrentEnvironment());
  }

  interpretDoWhileStatement(node) {
    if (this.debugging) console.log("do while statement");
    if (this.debugging) console.log(node);

    const newEnvironment = this.createEnvironment(this.getCurrentEnvironment());      // enter a new environment
    this.addNewEnvironment(newEnvironment);

    // interpret the iteration
    do {
      this.interpretBlockStatement(node.body);       // interpret the body of the for loop
    } while (this.interpretExpression(node.test));

    // exit the environment
    this.removeCurrentEnvironment();
    this.updateStateVariables(this.getCurrentEnvironment());
  }

  interpretSwitchStatement(node) {
    if (this.debugging) console.log("switch statement");
    if (this.debugging) console.log(node);

    const newEnvironment = this.createEnvironment(this.getCurrentEnvironment());      // enter a new environment
    this.addNewEnvironment(newEnvironment);

    const value = this.interpretExpression(node.discriminant);

    for (let i = 0; i < node.cases.length; i++) {
      const caseNode = node.cases[i];
      const test = this.interpretExpression(caseNode.test);

      if (test === null || test === value) {  // if the test is null, it is the default case
        // interpret the body of the case
        for (let i = 0; i < caseNode.consequent.length; i++) {
          this.executeNodeType(caseNode.consequent[i]);
        }
        break;
      }
    }

    // exit the environment
    this.removeCurrentEnvironment();
    this.updateStateVariables(this.getCurrentEnvironment());
  }

  interpretReturnStatement(node) {
    if (this.debugging) console.log("return statement");
    if (this.debugging) console.log(node);

    const environment = this.getCurrentEnvironment()
    environment.returnValue = this.interpretExpression(node.argument);
  }

  /* STANDARD FUNCTIONS */

  interpretConsoleLog(node) {
    if (this.debugging) console.log("console log");
    if (this.debugging) console.log(node);

    const argument = this.interpretExpression(node.arguments[0]);
    this.updateCallback({ command: 'consoleLog', argument: argument });
  }

}
