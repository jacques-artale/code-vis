// https://docs.esprima.org/en/4.0/syntax-tree-format.html#expressions-and-patterns

export class Interpreter {

  debugging = false;

  updateCallback = null;
  globalEnvironment = null;
  functionDeclarations = [];
  environmentStack = [];

  parsedCode = null;

  constructor(parsedCode, updateCallback) {
    this.parsedCode = parsedCode;
    this.updateCallback = updateCallback;

    this.globalEnvironment = this.createEnvironment(null, parsedCode, parsedCode.body);
    this.globalEnvironment.executionState.type = 'global';
    this.environmentStack.push(this.globalEnvironment);
  }

  // This function will reset the interpreter to its initial state, keeping the parsed code
  clearInternalState() {
    this.globalEnvironment = this.createEnvironment(null, this.parsedCode, this.parsedCode.body);
    this.globalEnvironment.executionState.type = 'global';
    this.environmentStack.push(this.globalEnvironment);
    this.functionDeclarations = [];
    this.environmentStack = [];
  }

  // This function will reset the interpreter as well as the parsed code
  setParsedCode(parsedCode) {
    this.parsedCode = parsedCode;
    this.functionDeclarations = [];
    this.environmentStack = [];
    this.globalEnvironment = this.createEnvironment(null, parsedCode, parsedCode.body);
    this.globalEnvironment.executionState.type = 'global';
    this.environmentStack.push(this.globalEnvironment);
  }

  /*
    HANDLE SCOPE AND ENVIRONMENT VARIABLES
  */
  createEnvironment(parent, node, instructions) {
    return {
      variables: [],                  // variables in our current scope
      arrayVariables: [],             // array variables in our current scope
      objectVariables: [],            // object variables in our current scope
      parentEnvironment: parent,      // the parent environment
      returnValues: [],               // a stack of return values
      executionState: {
        type: '',                     // the type of the current instruction (for, while, if, etc.)
        phase: '',                    // the phase of the current instruction (init, test, body, update, etc.)
        node: node,                   // the node containing the instructions to execute
        instructions: instructions,   // the instructions to execute (for example the body of a for loop)
        instructionPointer: 0,        // where we currently are in the instructions
      },
    };
  }

  getCurrentEnvironment() {
    if (this.environmentStack.length === 0) return null;
    return this.environmentStack[this.environmentStack.length - 1];
  }

  addNewEnvironment(environment) {
    this.environmentStack.push(environment);
  }

  removeCurrentEnvironment() {
    if (this.environmentStack.length === 1) return; // do not remove the global environment
    this.environmentStack.pop();
    this.updateStateVariables(this.getCurrentEnvironment());
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

  createVariable(name, value, environment) {
    if (name in environment.variables) {
      console.error(`Expression interpreter error: Variable ${name} already exists`);
      return;
    }
    environment.variables[name] = value;

    this.updateStateVariables(environment);
  }

  createArrayVariable(name, values, environment) {
    if (name in environment.arrayVariables) {
      console.error(`Expression interpreter error: Array variable ${name} already exists`);
      return;
    }
    environment.arrayVariables[name] = values;

    this.updateStateVariables(environment);
  }

  createObjectVariable(name, value, environment) {
    if (name in environment.objectVariables) {
      console.error(`Expression interpreter error: Object variable ${name} already exists`);
      return;
    }
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

    /*
    for (let i = 0; i < this.parsedCode.body.length; i++) {
      this.executeNodeType(this.parsedCode.body[i]);
    }
    */

    let iterations = 0;

    const executionState = this.getCurrentEnvironment().executionState;
    while (executionState.instructionPointer < executionState.instructions.length) {
      this.interpretNextInstruction();
      iterations++;

      if (iterations > 1000) {
        //console.error("infinite loop detected");
        break;
      }
    }
  }

  interpretNextInstruction() {
    const node = this.getExecutingNode();
    if (node === null) return;

    // IF WE ARE IN A BLOCK WE MIGHT GET A 'break' OR 'continue' HERE
    // IF WE GET A 'break' WE SHOULD EXIT THE BLOCK, THAT IS, REMOVE THE BLOCK ENVIRONMENT AND THE WHILE OR FOR ENVIRONMENT CONTAINING IT
    // IF WE GET A 'continue' WE SHOULD EXIT THE BLOCK, BUT NOT THE WHILE OR FOR ENVIRONMENT CONTAINING IT
    // WE ALSO NEED TO CHECK HOW THIS MIGHT AFFECT SWITCH STATEMENTS AND SUCH
    this.executeNodeType(node);
  }

  getExecutingNode() {
    const environment = this.getCurrentEnvironment();
    if (environment === null) return null;

    const node = environment.executionState.node;
    return node;
  }

  getNextInstruction() {
    const environment = this.getCurrentEnvironment();
    if (environment === null) return null;

    const instructions = environment.executionState.instructions;
    const instructionPointer = environment.executionState.instructionPointer;

    if (instructionPointer >= instructions.length) return null; // end of program
    return instructions[instructionPointer];
  }

  gotoNextInstruction() {
    const environment = this.getCurrentEnvironment();
    environment.executionState.instructionPointer++;
  }

  executeNodeType(node) {
    if (this.debugging) console.log("execute node type");
    if (this.debugging) console.log(node);

    switch (node.type) {
      case 'Program':
        return this.interpretProgram(node);
      case 'VariableDeclaration':
        return this.interpretVariableDeclaration(node);
      case 'FunctionDeclaration':
        return this.interpretFunctionDeclaration(node);
      case 'BlockStatement':
        return this.interpretBlockStatement(node);
      case 'ExpressionStatement':
        return this.interpretExpressionStatement(node.expression);
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
      case 'BreakStatement':
        return this.interpretBreakStatement(node);
      case 'ContinueStatement':
        return 'continue'; // do nothing
      case 'EmptyStatement':
        return; // do nothing
      default:
        console.log('unrecognized node type: ' + node.type);
    }
  }

  interpretProgram(node) {
    if (this.debugging) console.log("program");
    if (this.debugging) console.log(node);

    const instruction = this.getNextInstruction();
    if (instruction === null) return;

    this.executeNodeType(instruction);
  }

  interpretExpression(node) {
    if (this.debugging) console.log("expression");
    if (this.debugging) console.log(node);
    if (node === null) return null;

    const environment = this.getCurrentEnvironment();

    switch (node.type) {
      case 'Literal':
        environment.returnValues.push(node.value);
        break;
      case 'Identifier':
        const value = this.lookupVariableValue(node.name, this.getCurrentEnvironment());
        environment.returnValues.push(value);
        break;
      case 'AssignmentExpression':
        return this.interpretAssignmentExpression(node);
      case 'BinaryExpression':
        this.interpretBinaryExpression(node);
        break;
      case 'LogicalExpression':
        return this.interpretLogicalExpression(node);
      case 'UnaryExpression':
        this.interpretUnaryExpression(node);
        break;
      case 'ArrayExpression':
        this.interpretArrayExpression(node);
        break;
      case 'ObjectExpression':
        this.interpretObjectExpression(node);
        break;
      case 'CallExpression':
        this.interpretCallExpression(node);
        break;
      case 'MemberExpression':
        this.interpretMemberExpression(node);
        break;
      case 'UpdateExpression':
        return this.interpretUpdateExpression(node);
      case 'SequenceExpression':
        return this.interpretSequenceExpression(node);
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

    switch (node.type) {
      case 'AssignmentExpression':
        return this.interpretAssignmentExpression(node);
      case 'BinaryExpression':
        return this.interpretBinaryExpression(node);
      case 'UpdateExpression':
        return this.interpretUpdateExpression(node);
      case 'CallExpression':
        return this.interpretCallExpression(node);
      case 'MemberExpression':
        return this.interpretMemberExpression(node);
      // Add other expression types as needed
      default:
        console.log('expression type not implemented yet');
    }
  }

  interpretAssignmentExpression(node) {
    if (this.debugging) console.log("assignment expression");
    if (this.debugging) console.log(node);

    // check if the assignment is to an object property
    if (node.left.type === 'MemberExpression') {
      // we update the property
      this.handleMemberExpressionAssignment(node);
    } else {
      // we update the variable
      this.handleVariableAssignment(node);
    }
  }

  handleMemberExpressionAssignment(node) {
    let environment = this.getCurrentEnvironment();
    if (environment.executionState.node !== node) {
      const instructions = [];
      let object = node.left;
      // example: object.property1.property2.property3 or object[0][1][2]
      while (object.type === 'MemberExpression') {
        instructions.unshift(object.property);
        object = object.object;
      }
      const newEnvironment = this.createEnvironment(environment, node, instructions);
      this.addNewEnvironment(newEnvironment);

      newEnvironment.executionState.type = 'memberAssignment';
      newEnvironment.executionState.phase = 'init';
      environment = newEnvironment;

      environment.returnValues.push(object);
      environment.returnValues.push([]); // array of properties such as [property1, property2, property3] || [0, 1, 2]
    }

    switch (environment.executionState.phase) {
      case 'init': { // interprets the property into a value
        const instruction = this.getNextInstruction();
        if (instruction === null) {
          environment.executionState.phase = 'object';
          break;
        }
        environment.executionState.phase = 'property';
        this.handleMemberProperty(instruction);
        break;
      }
      case 'property': { // adds the property value to the properties array
        environment.executionState.phase = 'init';
        const property = environment.returnValues.pop();
        const properties = [property, ...environment.returnValues.pop()];
        environment.returnValues.push(properties);

        this.gotoNextInstruction();
        break;
      }
      case 'object': { // finds the value of the object
        environment.executionState.phase = 'evaluate';
        const properties = environment.returnValues.pop();
        const object = environment.returnValues.pop();
        environment.returnValues.push(object);
        environment.returnValues.push(properties);

        this.interpretExpression(object);
        break;
      }
      case 'evaluate': { // finds the value of the final property and evaluates the right side of the assignment
        environment.executionState.phase = 'end';
        const objectValue = environment.returnValues.pop();
        const properties = environment.returnValues.pop();
        
        let oldValue = objectValue;
        for (let i = 0; i < properties.length; i++) {
          oldValue = oldValue[properties[i]];
        }
        environment.returnValues.push(properties);
        environment.returnValues.push(oldValue);

        this.interpretExpression(node.right);
        break;
      }
      case 'end': { // updates the value of the final property
        const operator = node.operator;
        const value = environment.returnValues.pop();
        const oldValue = environment.returnValues.pop();
        const properties = environment.returnValues.pop();
        const object = environment.returnValues.pop();

        const newValue = this.updateMemberAssignmentValue(oldValue, operator, value);

        // TODO: handle this better as it could be something other than an identifier
        let identifier = null;
        if (object.type === 'Identifier') {
          identifier = object.name;
        }

        this.removeCurrentEnvironment();
        this.updateVariableProperty(identifier, properties, newValue, this.getCurrentEnvironment()); // identifier[properties[0]][properties[1]][...] = value;
        this.gotoNextInstruction();
      }
    }
  }

  updateMemberAssignmentValue(oldValue, operator, value) {
    switch (operator) {
      case "=": return value;
      case "+=": return oldValue + value;
      case "-=": return oldValue - value;
      case "*=": return oldValue * value;
      case "/=": return oldValue / value;
      case "%=": return oldValue % value;
      case "<<=": return oldValue << value;
      case ">>=": return oldValue >> value;
      case ">>>=": return oldValue >>> value;
      case "&=": return oldValue & value;
      case "|=": return oldValue | value;
      case "^=": return oldValue ^ value;
      default:
        console.error("unknown operator: " + operator);
        return oldValue;
    }
  }

  handleMemberProperty(node) {
    if (node.type === 'Identifier') {
      if (node.name === 'length') return node.name;

      const value = this.lookupVariableValue(node.name, this.getCurrentEnvironment());
      if (value !== null) {
        this.getCurrentEnvironment().returnValues.push(value);
        return;
      }

      const functionDeclaration = this.lookupFunction(node.name);
      if (functionDeclaration !== null) {
        this.getCurrentEnvironment().returnValues.push(functionDeclaration);
        return;
      }

      // if we get here then the identifier must be a property
      this.getCurrentEnvironment().returnValues.push(node.name);
    } else {
      this.interpretExpression(node);
    }
  }

  handleVariableAssignment(node) {
    const varName = node.left.name;
    const value = this.interpretExpression(node.right);
    const operator = node.operator;

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

    let environment = this.getCurrentEnvironment();
    if (environment.executionState.node !== node) {
      // Create a new environment for the binary expression's scope
      const instructions = [];
      const newEnvironment = this.createEnvironment(environment, node, instructions);
      this.addNewEnvironment(newEnvironment);

      newEnvironment.executionState.type = 'binary';
      newEnvironment.executionState.phase = 'left';
      environment = newEnvironment;
    }

    switch (environment.executionState.phase) {
      case 'left':
        environment.executionState.phase = 'right';
        this.interpretExpression(node.left);
        break;
      case 'right':
        environment.executionState.phase = 'end';
        this.interpretExpression(node.right);
        break;
      case 'end':
        const rightResult = environment.returnValues.pop();
        const leftResult = environment.returnValues.pop();
        const operator = node.operator;

        this.removeCurrentEnvironment();

        const result = this.evaluateBinaryExpression(leftResult, rightResult, operator);
        this.getCurrentEnvironment().returnValues.push(result);
    }
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

    let environment = this.getCurrentEnvironment();
    if (environment.executionState.node !== node) {
      const instructions = [];
      const newEnvironment = this.createEnvironment(environment, node, instructions);
      this.addNewEnvironment(newEnvironment);

      newEnvironment.executionState.type = 'unary';
      newEnvironment.executionState.phase = 'evaluate';
      environment = newEnvironment;
    }

    switch (environment.executionState.phase) {
      case 'evaluate':
        environment.executionState.phase = 'end';
        this.interpretExpression(node.argument);
        break;
      case 'end':
        const value = environment.returnValues.pop();
        const operator = node.operator;

        this.removeCurrentEnvironment();

        let result = value;
        if (operator === "!") result = !value;
        else if (operator === "-") result = -value;
        else if (operator === "+") result = +value;
        else if (operator === "~") result = ~value;
        else if (operator === "typeof") result = typeof value;
        else if (operator === "void") result = void value;
        else {
          console.error("unknown operator: " + operator);
        }

        this.getCurrentEnvironment().returnValues.push(result);
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
    let oldValue = objectValue;
    for (let i = 0; i < properties.length; i++) {
      oldValue = oldValue[properties[i]];
    }

    // update
    let value = oldValue;
    if (operator === '++') value++;
    else if (operator === '--') value--;
    else console.error("weird error, operator not found");

    this.updateVariableProperty(identifier, properties, value, this.getCurrentEnvironment()); // identifier[property[0]][property[1]][...] = value;

    if (node.prefix) return value;
    return oldValue;
  }

  handleUpdateVariableExpression(node) {
    const varName = node.argument.name;
    const operator = node.operator;
    const oldValue = this.lookupVariableValue(varName, this.getCurrentEnvironment());

    let value = oldValue;
    if (operator === '++') value++;
    else if (operator === '--') value--;
    else console.error("weird error, operator not found");

    this.updateVariableValue(varName, value, this.getCurrentEnvironment());

    if (node.prefix) return value;
    return oldValue;
  }

  interpretCallExpression(node) {
    if (this.debugging) console.log("call expression");
    if (this.debugging) console.log(node);

    // TODO: merge this with the switch case
    const callee = node.callee;
    if (callee.type === 'MemberExpression') {
      // check if the function is a built-in function with return type
      const standard = this.handleStandardFunctions(node);
      if (standard !== null) return standard;

      // check if the function is a built-in function without return type
      if (callee.object.name === 'console' && callee.property.name === 'log') {
        this.interpretConsoleLog(node);
        return;
      }
    }

    let environment = this.getCurrentEnvironment();
    if (environment.executionState.node !== node) {
      // Create a new environment for the function call's scope
      const instructions = [];
      const newEnvironment = this.createEnvironment(this.globalEnvironment, node, instructions);
      this.addNewEnvironment(newEnvironment);

      newEnvironment.executionState.type = 'call';
      newEnvironment.executionState.phase = 'init';
      environment = newEnvironment;
    }

    const functionDeclaration = this.lookupFunction(node.callee.name);
    switch (environment.executionState.phase) {
      case 'init':
        environment.executionState.phase = 'call';
        // load arguments into the environment
        const callArguments = node.arguments;
        const argumentValues = [];
        for (let i = 0; i < callArguments.length; i++) {
          argumentValues.push(this.interpretExpression(callArguments[i]));
        }
        // add the parameters to the environment (new variables with values of callArguments)
        for (let i = 0; i < functionDeclaration.parameters.length; i++) {
          const parameter = functionDeclaration.parameters[i];
          const parameterValue = argumentValues[i];
          this.createVariable(parameter.name, parameterValue, environment); // TODO: check if this could be array or object variables as well
        }
        break;
      case 'call':
        environment.executionState.phase = 'end';
        this.interpretBlockStatement(functionDeclaration.body);  // interpret the body of the function
        break;
      case 'end':
        const value = environment.returnValues.pop();
        this.removeCurrentEnvironment();
        environment = this.getCurrentEnvironment();
        environment.returnValues.push(value); // pass the return value to the previous environment
    }
  }

  handleStandardFunctions(node) {
    if (node.callee.type === 'MemberExpression') {
      if (node.callee.object.name === 'Math') {
        if (node.callee.property.name === 'max') return this.interpretMathMax(node);
        if (node.callee.property.name === 'min') return this.interpretMathMin(node);
        if (node.callee.property.name === 'abs') return this.interpretMathAbs(node);
      }
      if (node.callee.property.name === 'push') {
        this.interpretArrayPush(node);
        return true;
      }
    }
    return null;
  }
  
  interpretMemberExpression(node) {
    if (this.debugging) console.log("member expression");
    if (this.debugging) console.log(node);

    let environment = this.getCurrentEnvironment();
    if (environment.executionState.node !== node) {
      // Create a new environment for the member expression's scope
      const instructions = [];
      const newEnvironment = this.createEnvironment(environment, node, instructions);
      this.addNewEnvironment(newEnvironment);

      newEnvironment.executionState.type = 'member';
      newEnvironment.executionState.phase = 'object';
      environment = newEnvironment;
    }

    switch (environment.executionState.phase) {
      case 'object':
        environment.executionState.phase = 'property';
        this.interpretExpression(node.object);
        break;
      case 'property':
        environment.executionState.phase = 'end';
        this.handleMemberProperty(node.property);
        break;
      case 'end':
        const property = environment.returnValues.pop();
        const object = environment.returnValues.pop();

        this.removeCurrentEnvironment();
        environment = this.getCurrentEnvironment();

        if (property === 'length') environment.returnValues.push(object.length);
        else environment.returnValues.push(object[property]);
    }
  }

  interpretConditionalExpression() {}

  interpretArrayPush(node) {
    if (this.debugging) console.log("array push");
    if (this.debugging) console.log(node);

    let environment = this.getCurrentEnvironment();
    if (environment.executionState.node !== node) {
      const instructions = [];
      const newEnvironment = this.createEnvironment(environment, node, instructions);
      this.addNewEnvironment(newEnvironment);

      newEnvironment.executionState.type = 'arrayPush';
      newEnvironment.executionState.phase = 'value';
      environment = newEnvironment;
    }

    switch (environment.executionState.phase) {
      case 'value':
        environment.executionState.phase = 'argument';
        this.interpretExpression(node.callee.object);
        break;
      case 'argument':
        environment.executionState.phase = 'end';
        this.interpretExpression(node.arguments[0]);
        break;
      case 'end':
        const argument = environment.returnValues.pop();
        const value = environment.returnValues.pop();
        const identifier = node.callee.object.name;
        const result = [...value, argument];
        this.removeCurrentEnvironment();

        this.updateVariableValue(identifier, result, this.getCurrentEnvironment());
        environment.returnValues.push(argument); // TODO: check all functions which should both update a value and then return a value, such as a++/++a etc

        this.gotoNextInstruction();
    }
  }

  interpretObjectExpression(node) {
    if (this.debugging) console.log("object expression");
    if (this.debugging) console.log(node);

    const properties = node.properties;

    // create the new object
    const object = {};
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      const key = property.key.name;
      this.interpretExpression(property.value);
      const value = this.getCurrentEnvironment().returnValues.pop();
      object[key] = value;
    }

    const environment = this.getCurrentEnvironment();
    environment.returnValues.push(object);
  }

  interpretArrayExpression(node) {
    if (this.debugging) console.log("array expression");
    if (this.debugging) console.log(node);

    const values = [];
    for (let i = 0; i < node.elements.length; i++) {
      this.interpretExpression(node.elements[i]);
      const value = this.getCurrentEnvironment().returnValues.pop();
      values.push(value);
    }

    const environment = this.getCurrentEnvironment();
    environment.returnValues.push(values);
  }

  interpretSequenceExpression(node) {
    if (this.debugging) console.log("sequence expression");
    if (this.debugging) console.log(node);

    for (let i = 0; i < node.expressions.length; i++) {
      this.interpretExpression(node.expressions[i]);
    }

    return null;
  }

  interpretVariableDeclaration(node) {
    if (this.debugging) console.log("variable declaration");
    if (this.debugging) console.log(node);

    let environment = this.getCurrentEnvironment();
    if (environment.executionState.node !== node) {
      // Create a new environment for the variable declaration
      const instructions = node.declarations;
      const newEnvironment = this.createEnvironment(environment, node, instructions);
      this.addNewEnvironment(newEnvironment);

      newEnvironment.executionState.type = 'variableDeclaration';
      newEnvironment.executionState.phase = 'init';
      environment = newEnvironment;
    }

    const declaration = this.getNextInstruction();

    if (declaration === null) environment.executionState.phase = 'end';

    switch (environment.executionState.phase) {
      case 'init':
        environment.executionState.phase = 'evaluate';
        break;
      case 'evaluate':
        environment.executionState.phase = 'declare';
        this.interpretExpression(declaration.init);
        break;
      case 'declare':
        environment.executionState.phase = 'init';
        const varName = declaration.id.name;
        const varType = declaration.init.type;
        const value = environment.returnValues.pop();
        const parent = environment.parentEnvironment;

        // check type of value and create the variable accordingly
        switch (varType) {
          case 'Literal':
          case 'BinaryExpression':
          case 'LogicalExpression':
          case 'UnaryExpression':
          case 'CallExpression':
          case 'UpdateExpression':
            this.createVariable(varName, value, parent);
            break;
          case 'ArrayExpression':
            this.createArrayVariable(varName, value, parent);
            break;
          case 'ObjectExpression':
            this.createObjectVariable(varName, value, parent);
            break;
          case 'MemberExpression':
            // check type of value and create the variable accordingly
            if (Array.isArray(value)) {
              this.createArrayVariable(varName, value, parent);
            } else if (typeof value === 'object') {
              this.createObjectVariable(varName, value, parent);
            } else {
              this.createVariable(varName, value, parent);
            }
            break;
          case 'Identifier':
            const varVal = this.lookupVariableValue(declaration.init.name, this.getCurrentEnvironment());
            this.createVariable(varName, varVal, parent);
            break;
          default:
            console.error(`Unrecognized variable type: ${varType}`);
        }
        this.gotoNextInstruction();
        break;
      case 'end':
        this.removeCurrentEnvironment();
        this.gotoNextInstruction();
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

    this.gotoNextInstruction();
  }

  interpretBlockStatement(node) {
    if (this.debugging) console.log("block statement");
    if (this.debugging) console.log(node);

    let environment = this.getCurrentEnvironment();
    if (environment.executionState.node !== node) {
      // Create a new environment for the block's scope
      const instructions = node.body;
      const newEnvironment = this.createEnvironment(environment, node, instructions);
      this.addNewEnvironment(newEnvironment);

      newEnvironment.executionState.type = 'block';
      environment = newEnvironment;
    }

    const instruction = this.getNextInstruction();

    if (instruction === null) {
      this.removeCurrentEnvironment();
      return null;
    }
    
    const result = this.executeNodeType(instruction);
    if (result === 'continue') {
      this.removeCurrentEnvironment();
      return result;
    }
    
    if (result === 'return') {
      const value = environment.returnValues.pop();
      this.removeCurrentEnvironment();
      this.getCurrentEnvironment().returnValues.push(value); // pass the return value to the parent environment (should always be a call)
      return 'return';
    }

    return null;
  }

  interpretIfStatement(node) {
    if (this.debugging) console.log("if statement");
    if (this.debugging) console.log(node);

    const test = this.interpretExpression(node.test);

    if (test) return this.executeNodeType(node.consequent);

    if (node.alternate === null) return;
    if (node.alternate.type === 'IfStatement') return this.interpretIfStatement(node.alternate);

    return this.executeNodeType(node.alternate);
  }

  interpretForStatement(node) {
    if (this.debugging) console.log("for statement");
    if (this.debugging) console.log(node);

    let environment = this.getCurrentEnvironment();

    if (environment.executionState.node !== node) {
      // Create a new environment for the for loop's scope
      const instructions = [node.init];
      const newEnvironment = this.createEnvironment(environment, node, instructions);
      this.addNewEnvironment(newEnvironment);

      newEnvironment.executionState.type = 'for';
      newEnvironment.executionState.phase = 'init';
      environment = newEnvironment;
    }

    switch (environment.executionState.phase) {
      case 'init':
        environment.executionState.phase = 'test';
        if (node.init !== null) {
          if (node.init.type === 'VariableDeclaration') this.interpretVariableDeclaration(node.init);
          else this.interpretExpression(node.init);
        }
        break;
      case 'test':
        if (node.test !== null && this.interpretExpression(node.test)) environment.executionState.phase = 'body';
        else environment.executionState.phase = 'end';
        break;
      case 'body':
        environment.executionState.phase = 'update';
        this.executeNodeType(node.body); // interpret the body of the for loop
        break;
      case 'update':
        environment.executionState.phase = 'test';
        this.interpretExpression(node.update);
        break;
      case 'end':
        this.removeCurrentEnvironment(); // removes the for-loop environment (containing the init variables)
    }
  }

  interpretWhileStatement(node) {
    if (this.debugging) console.log("while statement");
    if (this.debugging) console.log(node);

    let environment = this.getCurrentEnvironment();

    if (environment.executionState.node !== node) {
      // Create a new environment for the while loop's scope
      const instructions = [];
      const newEnvironment = this.createEnvironment(environment, node, instructions);
      this.addNewEnvironment(newEnvironment);

      newEnvironment.executionState.type = 'while';
      newEnvironment.executionState.phase = 'test';
      environment = newEnvironment;
    }

    switch (environment.executionState.phase) {
      case 'test':
        if (this.interpretExpression(node.test)) environment.executionState.phase = 'body';
        else environment.executionState.phase = 'end';
        break;
      case 'body':
        environment.executionState.phase = 'test';
        this.executeNodeType(node.body); // interpret the body of the while loop
        break;
      case 'end':
        this.removeCurrentEnvironment(); // removes the while-loop environment
    }
  }

  interpretDoWhileStatement(node) {
    if (this.debugging) console.log("do while statement");
    if (this.debugging) console.log(node);

    let environment = this.getCurrentEnvironment();

    if (environment.executionState.node !== node) {
      // Create a new environment for the do while loop's scope
      const instructions = [];
      const newEnvironment = this.createEnvironment(environment, node, instructions);
      this.addNewEnvironment(newEnvironment);

      newEnvironment.executionState.type = 'doWhile';
      newEnvironment.executionState.phase = 'body';
      environment = newEnvironment;
    }

    switch (environment.executionState.phase) {
      case 'test':
        if (this.interpretExpression(node.test)) environment.executionState.phase = 'body';
        else environment.executionState.phase = 'end';
        break;
      case 'body':
        environment.executionState.phase = 'test';
        this.executeNodeType(node.body); // interpret the body of the do while loop
        break;
      case 'end':
        this.removeCurrentEnvironment(); // removes the do while-loop environment
    }
  }

  interpretSwitchStatement(node) {
    if (this.debugging) console.log("switch statement");
    if (this.debugging) console.log(node);

    const value = this.interpretExpression(node.discriminant);

    let foundMatch = false;

    for (let i = 0; i < node.cases.length; i++) {
      const caseNode = node.cases[i];
      const test = this.interpretExpression(caseNode.test);

      if (test === null || test === value) foundMatch = true;

      if (foundMatch) {  // if the test is null, it is the default case
        // enter a new environment
        const newEnvironment = this.createEnvironment(this.getCurrentEnvironment(), caseNode.consequent);
        this.addNewEnvironment(newEnvironment);

        // interpret the body of the case
        let result = null;
        for (let i = 0; i < caseNode.consequent.length; i++) {
          result = this.executeNodeType(caseNode.consequent[i]);
          if (result === 'break') break;
        }

        // exit the environment
        this.removeCurrentEnvironment();
        if (result === 'break') break;
      }
    }
  }

  interpretBreakStatement(node) {
    if (this.debugging) console.log("break statement");
    if (this.debugging) console.log(node);

    let environment = this.getCurrentEnvironment();
    let type = environment.executionState.type;
    // purge all environments until we reach a statement that can handle a break
    while (type != 'global' && type != 'for' && type != 'while' && type != 'doWhile' && type != 'switch') {
      this.removeCurrentEnvironment();
      environment = this.getCurrentEnvironment();
      type = environment.executionState.type;
    }

    this.removeCurrentEnvironment();
    environment = this.getCurrentEnvironment();

    return 'break';
  }

  interpretReturnStatement(node) {
    if (this.debugging) console.log("return statement");
    if (this.debugging) console.log(node);

    this.interpretExpression(node.argument);

    return 'return';
  }

  /* STANDARD FUNCTIONS */

  interpretConsoleLog(node) {
    if (this.debugging) console.log("console log");
    if (this.debugging) console.log(node);

    const argument = this.interpretExpression(node.arguments[0]);
    this.updateCallback({ command: 'consoleLog', argument: argument });
  }

  interpretMathMax(node) {
    if (this.debugging) console.log("math max");
    if (this.debugging) console.log(node);

    const argument1 = this.interpretExpression(node.arguments[0]);
    const argument2 = this.interpretExpression(node.arguments[1]);

    return Math.max(argument1, argument2);
  }

  interpretMathMin(node) {
    if (this.debugging) console.log("math min");
    if (this.debugging) console.log(node);

    const argument1 = this.interpretExpression(node.arguments[0]);
    const argument2 = this.interpretExpression(node.arguments[1]);

    return Math.min(argument1, argument2);
  }

  interpretMathAbs(node) {
    if (this.debugging) console.log("math abs");
    if (this.debugging) console.log(node);

    const argument = this.interpretExpression(node.arguments[0]);

    return Math.abs(argument);
  }

}
