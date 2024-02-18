// https://docs.esprima.org/en/4.0/syntax-tree-format.html#expressions-and-patterns

export class Interpreter {

  debugging = false;

  updateCallback = null;
  globalEnvironment = null;
  functionDeclarations = [];
  environmentStack = [];
  uniqueEnvironmentId = 0;

  builtInVariables = {
    'undefined': undefined,
  }

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
    this.uniqueEnvironmentId = 0;
  }

  // This function will reset the interpreter as well as the parsed code
  setParsedCode(parsedCode) {
    this.parsedCode = parsedCode;
    this.functionDeclarations = [];
    this.environmentStack = [];
    this.uniqueEnvironmentId = 0;
    this.globalEnvironment = this.createEnvironment(null, parsedCode, parsedCode.body);
    this.globalEnvironment.executionState.type = 'global';
    this.environmentStack.push(this.globalEnvironment);
  }

  updateCurrentExecutingNode(nodeId, nodeType) {
    this.updateCallback({ command: 'updateActiveNode', nodeId: nodeId, nodeType: nodeType });
  }

  /*
    HANDLE SCOPE AND ENVIRONMENT VARIABLES
  */
  createEnvironment(parent, node, instructions) {
    return {
      id: this.uniqueEnvironmentId++, // a unique id for the environment
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
    this.updateStateVariables();
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
    this.updateCallback({ command: 'error', error: `Function '${name}' is not defined` });
    return null;
  }

  createVariable(name, value, environment) { // TODO: redeclaration of variable using var should be allowed
    if (name in environment.variables || name in environment.arrayVariables || name in environment.objectVariables) {
      console.error(`Expression interpreter error: Variable ${name} already exists`);
      this.updateCallback({ command: 'error', error: `Identifier '${name}' has already been declared` });
      return;
    }
    environment.variables[name] = value;

    this.updateStateVariables();
    this.updateCallback({ command: 'createVariable', scopeId: environment.id, name: name });
  }

  createArrayVariable(name, values, environment) {
    if (name in environment.arrayVariables || name in environment.variables || name in environment.objectVariables) {
      console.error(`Expression interpreter error: Array variable ${name} already exists`);
      this.updateCallback({ command: 'error', error: `Identifier '${name}' has already been declared` });
      return;
    }
    environment.arrayVariables[name] = values;

    this.updateStateVariables();
    this.updateCallback({ command: 'createVariable', scopeId: environment.id, name: name });
  }

  createObjectVariable(name, value, environment) {
    if (name in environment.objectVariables || name in environment.variables || name in environment.arrayVariables) {
      console.error(`Expression interpreter error: Object variable ${name} already exists`);
      this.updateCallback({ command: 'error', error: `Identifier '${name}' has already been declared` });
      return;
    }
    environment.objectVariables[name] = value;

    this.updateStateVariables();
    this.updateCallback({ command: 'createVariable', scopeId: environment.id, name: name });
  }

  lookupVariableValue(name, environment) {
    let value = null;
    let currentEnvironment = environment;
    while (currentEnvironment !== null) {
      if (name in this.builtInVariables){
        value = this.builtInVariables[name];
      } else if (name in currentEnvironment.variables) {
        value = currentEnvironment.variables[name];
      } else if (name in currentEnvironment.arrayVariables) {
        value = currentEnvironment.arrayVariables[name];
      } else if (name in currentEnvironment.objectVariables) {
        value = currentEnvironment.objectVariables[name];
      }

      if (value !== null) break;
      currentEnvironment = currentEnvironment.parentEnvironment;
    }

    if (value !== null) {
      this.updateCallback({ command: 'accessVariable', scopeId: currentEnvironment.id, name: name, properties: null });
    }

    if (this.debugging && value === null) {
      console.error(`Expression interpreter error: Variable ${name} not found`);
    }

    return value;
  }

  lookupVariableScope(name, environment) {
    let currentEnvironment = environment;
    while (currentEnvironment !== null) {
      if (name in currentEnvironment.variables) {
        return currentEnvironment;
      }
      if (name in currentEnvironment.arrayVariables) {
        return currentEnvironment;
      }
      if (name in currentEnvironment.objectVariables) {
        return currentEnvironment;
      }
      currentEnvironment = currentEnvironment.parentEnvironment;
    }
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

    if (currentEnvironment === null) {
      console.error(`Expression interpreter error: Variable ${name} not found`);
      this.updateCallback({ command: 'error', error: `Identifier '${name}' is not defined` });
      return;
    }

    this.updateStateVariables();
    this.updateCallback({ command: 'updatedVariable', scopeId: currentEnvironment.id, name: name, properties: null });
  }

  updateVariableProperty(name, properties, value, environment) {
    let currentEnvironment = environment;
    while (currentEnvironment !== null) {
      let variable = currentEnvironment.arrayVariables[name] || currentEnvironment.objectVariables[name];
      if (variable) {
        let error = false;
        for (let i = 0; i < properties.length - 1; i++) {
          if (variable[properties[i]] === undefined) {
            this.updateCallback({ command: 'error', error: `Property ${properties[i]} cannot be set on ${variable}` });
            error = true;
            break;
          }
          variable = variable[properties[i]];
        }
        if (!error) {
          if (variable[properties[properties.length - 1]] === undefined) {
            this.updateCallback({ command: 'error', error: `Property ${properties[properties.length - 1]} cannot be set on ${variable}` });
          } else {
            variable[properties[properties.length - 1]] = value;
          }
        }
        break;
      }
      currentEnvironment = currentEnvironment.parentEnvironment;
    }

    if (currentEnvironment === null) {
      console.error(`Expression interpreter error: Variable ${name} not found`);
      this.updateCallback({ command: 'error', error: `Identifier '${name}' is not defined` });
      return;
    }

    this.updateStateVariables();
    this.updateCallback({ command: 'updatedVariable', scopeId: currentEnvironment.id, name: name, properties: properties });
  }

  updateStateVariables() {
    // add all variables from the environment to the state variables
    // do so for all environments
    let scopes = [];

    for (let i = 0; i < this.environmentStack.length; i++) {
      const environment = this.environmentStack[i];
      const type = environment.executionState.type;

      // only add scopes for the following types
      if (type !== 'global' && type !== 'call' && type !== 'block' && type !== 'for' && type !== 'switchCase') {
        continue;
      }

      let variables = [];
      let arrayVariables = [];

      for (const [name, value] of Object.entries(environment.variables)) {
        variables.push([name, value]);
      }
      for (const [name, properties] of Object.entries(environment.objectVariables)) {
        variables.push([name, properties]);
      }
      for (const [name, values] of Object.entries(environment.arrayVariables)) {
        arrayVariables.push([name, values]);
      }

      // find the first parent environment which we can use as the parent scope
      let currentEnvironment = environment.parentEnvironment;
      if (currentEnvironment !== null) {
        let currentType = currentEnvironment.executionState.type;
        while (currentType !== 'global' && currentType !== 'call' && currentType !== 'block' && currentType !== 'for' && currentType !== 'switchCase') {
          currentEnvironment = currentEnvironment.parentEnvironment;
          currentType = currentEnvironment.executionState.type;
        }
      }
      
      const parentId = (currentEnvironment !== null) ? currentEnvironment.id : null;
      const currentId = environment.id;

      const scope = {
        name: this.translateTypeToName(environment.executionState.node.type),
        variables: variables,
        arrayVariables: arrayVariables,
        parentId: parentId,
        id: currentId,
        active: false,
      };

      scopes.push(scope);
    }

    scopes[scopes.length - 1].active = true;

    this.updateCallback({ command: 'updateScopes', scopes: scopes });
  }

  translateTypeToName(type) {
    switch (type) {
      case 'Program': return 'Global Scope';
      case 'VariableDeclaration': return 'Variable Declaration';
      case 'FunctionDeclaration': return 'Function Declaration';
      case 'BlockStatement': return 'Block Statement';
      case 'ExpressionStatement': return 'Expression Statement';
      case 'AssignmentExpression': return 'Assignment Expression';
      case 'BinaryExpression': return 'Binary Expression';
      case 'LogicalExpression': return 'Logical Expression';
      case 'UnaryExpression': return 'Unary Expression';
      case 'UpdateExpression': return 'Update Expression';
      case 'ArrayExpression': return 'Array Expression';
      case 'ObjectExpression': return 'Object Expression';
      case 'SequenceExpression': return 'Sequence Expression';
      case 'IfStatement': return 'If Statement';
      case 'ForStatement': return 'For Statement';
      case 'WhileStatement': return 'While Statement';
      case 'DoWhileStatement': return 'Do While Statement';
      case 'ReturnStatement': return 'Return Statement';
      case 'CallExpression': return 'Call Expression';
      case 'MemberExpression': return 'Member Expression';
      case 'ConditionalExpression': return 'Conditional Expression';
      case 'SwitchStatement': return 'Switch Statement';
      case 'SwitchCase': return 'Switch Case';
      case 'BreakStatement': return 'Break Statement';
      case 'ContinueStatement': return 'Continue Statement';
      case 'EmptyStatement': return 'Empty Statement';
      default: return 'unknown type';
    }
  }

  /*
    INTERPRETATION FUNCTIONS
  */
  interpretAllInstructions() {
    if (this.debugging) console.log(this.parsedCode);

    let iterations = 0;

    let environment = this.getCurrentEnvironment();
    let type = environment.executionState.type;
    let instructionLength = environment.executionState.instructions.length;
    let instructionPointer = environment.executionState.instructionPointer;

    while (type !== 'global' || instructionPointer < instructionLength) {
      environment = this.getCurrentEnvironment();
      type = environment.executionState.type;
      instructionLength = environment.executionState.instructions.length;
      instructionPointer = environment.executionState.instructionPointer;

      this.interpretNextInstruction();

      iterations++;
      if (iterations > 1000) {
        console.error("infinite loop detected");
        break;
      }
    }
  }

  interpretNextInstruction() {
    const node = this.getExecutingNode();
    if (node === null) return;

    const environment = this.getCurrentEnvironment();
    const instructionLength = environment.executionState.instructions.length;
    const instructionPointer = environment.executionState.instructionPointer;
    if (environment.executionState.type === 'global' && instructionPointer >= instructionLength) {
      this.updateCallback({ command: 'end' });
      return;
    }

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
      case 'ArrayExpression':
        return this.interpretArrayExpression(node);
      case 'ObjectExpression':
        return this.interpretObjectExpression(node);
      case 'SequenceExpression':
        return this.interpretSequenceExpression(node);
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
      case 'SwitchCase':
        return this.interpretSwitchCase(node);
      case 'BreakStatement':
        return this.interpretBreakStatement(node);
      case 'ContinueStatement':
        return this.interpretContinueStatement(node);
      case 'EmptyStatement':
        return; // do nothing
      default:
        console.log('unrecognized node type: ' + node.type);
        this.updateCallback({ command: 'error', error: `Unrecognized node type: ${node.type}` });
    }
  }

  interpretProgram(node) {
    if (this.debugging) console.log("program");
    if (this.debugging) console.log(node);

    const instruction = this.getNextInstruction();
    if (instruction === null) return;

    this.gotoNextInstruction();
    this.executeNodeType(instruction);
  }

  interpretExpression(node) {
    if (this.debugging) console.log("expression");
    if (this.debugging) console.log(node);
    if (node === null) return null;

    this.updateCurrentExecutingNode(node.nodeId, node.type);

    const environment = this.getCurrentEnvironment();

    switch (node.type) {
      case 'Literal':
        environment.returnValues.push({ value: node.value });
        break;
      case 'Identifier':
        const value = this.lookupVariableValue(node.name, this.getCurrentEnvironment());
        environment.returnValues.push({ value: value });
        break;
      case 'AssignmentExpression':
        return this.interpretAssignmentExpression(node);
      case 'BinaryExpression':
        this.interpretBinaryExpression(node);
        break;
      case 'LogicalExpression':
        this.interpretLogicalExpression(node);
        break;
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
        this.interpretUpdateExpression(node);
        break;
      case 'SequenceExpression':
        this.interpretSequenceExpression(node);
        break;
      case 'ConditionalExpression':
        this.interpretConditionalExpression(node);
        break;
      default:
        console.error(`Unrecognized node type: ${node.type}`);
        this.updateCallback({ command: 'error', error: `Unrecognized node type: ${node.type}` });
    }
  }

  evaluateBinaryExpression(left, right, operator) {
    switch (operator) {
      case '+':   return left + right;
      case '-':   return left - right;
      case '*':   return left * right;
      case '/':   return left / right;
      case '%':   return left % right;
      case '==':  return left == right;
      case '===': return left === right;
      case '!=':  return left != right;
      case '!==': return left !== right;
      case '<':   return left < right;
      case '<=':  return left <= right;
      case '>':   return left > right;
      case '>=':  return left >= right;
      case '&&':  return left && right;
      case '||':  return left || right;
      case '<<':  return left << right;
      case '>>':  return left >> right;
      case '>>>': return left >>> right;
      case '&':   return left & right;
      case '|':   return left | right;
      case '^':   return left ^ right;
      case 'in':  return left in right;
      // Add other operators as needed, possibly power operator and such
      default:
        console.error(`Unrecognized operator: ${operator}`);
        this.updateCallback({ command: 'error', error: `Unrecognized operator: ${operator}` });
    }
  }

  interpretExpressionStatement(node) {
    if (this.debugging) console.log("expression statement");
    if (this.debugging) console.log(node);

    this.updateCurrentExecutingNode(node.nodeId, node.type);

    switch (node.type) {
      case 'AssignmentExpression':
        this.interpretAssignmentExpression(node);
        break;
      case 'BinaryExpression':
        this.interpretBinaryExpression(node);
        break;
      case 'UpdateExpression':
        this.interpretUpdateExpression(node);
        break;
      case 'CallExpression':
        this.interpretCallExpression(node);
        break;
      case 'MemberExpression':
        this.interpretMemberExpression(node);
        break;
      case 'ConditionalExpression':
        this.interpretConditionalExpression(node);
        break;
      default:
        console.log('expression type not implemented yet');
        this.updateCallback({ command: 'error', error: `Expression type not implemented yet: ${node.type}` });
    }
  }

  interpretAssignmentExpression(node) {
    if (this.debugging) console.log("assignment expression");
    if (this.debugging) console.log(node);

    this.updateCurrentExecutingNode(node.nodeId, node.type);

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
    this.updateCurrentExecutingNode(node.nodeId, node.type);

    let environment = this.getCurrentEnvironment();
    if (environment.executionState.node !== node) {
      const instructions = [];
      let object = node.left;
      // example: object.property1.property2.property3 or object[0][1][2]
      while (object.type === 'MemberExpression') {
        instructions.unshift({ property: object.property, computed: object.computed });
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
        this.handleMemberProperty(instruction.property, instruction.computed);
        break;
      }
      case 'property': { // adds the property value to the properties array
        environment.executionState.phase = 'init';
        const init = environment.returnValues.pop();
        const properties = [...environment.returnValues.pop(), init.value];
        environment.returnValues.push(properties);

        this.gotoNextInstruction();
        if (this.getNextInstruction() !== null) break;
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
        const object = environment.returnValues.pop();
        const objectValue = object.value;
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
        const evaluate = environment.returnValues.pop();
        const value = evaluate.value;
        const oldValue = environment.returnValues.pop();
        const properties = environment.returnValues.pop();
        const object = environment.returnValues.pop();

        const newValue = this.handleAssignmentOperation(oldValue, operator, value);
        
        this.removeCurrentEnvironment();
        if (object.type === 'Identifier') {
          this.updateVariableProperty(object.name, properties, newValue, this.getCurrentEnvironment()); // identifier[properties[0]][properties[1]][...] = value;
        } else {
          console.error("object does not have an identifier");
          // TODO: handle this case, update the object property anyway (but it won't be saved)
        }
        break;
      }
      default:
        console.error("unknown phase: " + environment.executionState.phase);
    }
  }

  handleAssignmentOperation(oldValue, operator, value) {
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
        this.updateCallback({ command: 'error', error: `Unrecognized operator: ${operator}` });
        return oldValue;
    }
  }

  handleMemberProperty(property, computed) {
    this.updateCurrentExecutingNode(property.nodeId, property.type);

    if (computed) {
      this.interpretExpression(property);
    } else {
      if (property.type === 'Identifier') this.getCurrentEnvironment().returnValues.push({ value: property.name });
      else console.error("property is not an identifier");
    }
  }

  handleVariableAssignment(node) {
    this.updateCurrentExecutingNode(node.nodeId, node.type);

    let environment = this.getCurrentEnvironment();
    if (environment.executionState.node !== node) {
      const instructions = [];
      const newEnvironment = this.createEnvironment(environment, node, instructions);
      this.addNewEnvironment(newEnvironment);

      newEnvironment.executionState.type = 'variableAssignment';
      newEnvironment.executionState.phase = 'init';
      environment = newEnvironment;
    }

    switch (environment.executionState.phase) {
      case 'init':
        environment.executionState.phase = 'end';
        this.interpretExpression(node.right);
        break;
      case 'end':
        environment.executionState.phase = 'end';
        const init = environment.returnValues.pop();
        const value = init.value;
        const varName = node.left.name;
        const operator = node.operator;

        const oldValue = this.lookupVariableValue(varName, this.getCurrentEnvironment());
        // if the variable is not found and operator is '=' create it in the global scope (example: num = 4)
        if (oldValue === null && operator === '=') {
          this.createVariable(varName, undefined, this.globalEnvironment);
        }

        const newValue = this.handleAssignmentOperation(oldValue, operator, value);

        this.removeCurrentEnvironment();
        environment = this.getCurrentEnvironment();
        this.updateVariableValue(varName, newValue, this.getCurrentEnvironment());
        break;
      default:
        console.error("unknown phase: " + environment.executionState.phase);
    }
  }

  interpretBinaryExpression(node) {
    if (this.debugging) console.log("binary expression");
    if (this.debugging) console.log(node);

    this.updateCurrentExecutingNode(node.nodeId, node.type);

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
        const right = environment.returnValues.pop();
        const left = environment.returnValues.pop();
        const rightResult = right.value;
        const leftResult = left.value;
        const operator = node.operator;

        this.removeCurrentEnvironment();

        const result = this.evaluateBinaryExpression(leftResult, rightResult, operator);
        this.getCurrentEnvironment().returnValues.push({ value: result });
        break;
      default:
        console.error("unknown phase: " + environment.executionState.phase);
    }
  }

  interpretLogicalExpression(node) {
    if (this.debugging) console.log("logical expression");
    if (this.debugging) console.log(node);

    this.updateCurrentExecutingNode(node.nodeId, node.type);

    let environment = this.getCurrentEnvironment();
    if (environment.executionState.node !== node) {
      const instructions = [];
      const newEnvironment = this.createEnvironment(environment, node, instructions);
      this.addNewEnvironment(newEnvironment);

      newEnvironment.executionState.type = 'logical';
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
        const right = environment.returnValues.pop();
        const left = environment.returnValues.pop();
        const rightResult = right.value;
        const leftResult = left.value;
        const operator = node.operator;
        const result = this.evaluateBinaryExpression(leftResult, rightResult, operator);

        this.removeCurrentEnvironment();

        this.getCurrentEnvironment().returnValues.push({ value: result });
        break;
      default:
        console.error("unknown phase: " + environment.executionState.phase);
    }
  }

  interpretUnaryExpression(node) {
    if (this.debugging) console.log("unary expression");
    if (this.debugging) console.log(node);

    this.updateCurrentExecutingNode(node.nodeId, node.type);

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
        const evaluate = environment.returnValues.pop();
        const value = evaluate.value;
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
          this.updateCallback({ command: 'error', error: `Unrecognized operator: ${operator}` });
        }

        this.getCurrentEnvironment().returnValues.push({ value: result });
        break;
      default:
        console.error("unknown phase: " + environment.executionState.phase);
    }
  }

  interpretUpdateExpression(node) {
    if (this.debugging) console.log("update expression");
    if (this.debugging) console.log(node);

    this.updateCurrentExecutingNode(node.nodeId, node.type);

    if (node.argument.type === 'MemberExpression') {
      // update the array or object property
      this.handleUpdateMemberExpression(node);
    } else {
      // update the variable
      this.handleUpdateVariableExpression(node);
    }
  }

  handleUpdateMemberExpression(node) {
    this.updateCurrentExecutingNode(node.nodeId, node.type);

    let environment = this.getCurrentEnvironment();
    if (environment.executionState.node !== node) {
      const instructions = [];
      let object = node.argument;
      // example: object.property1.property2.property3 or object[0][1][2]
      while (object.type === 'MemberExpression') {
        instructions.unshift({ property: object.property, computed: object.computed });
        object = object.object;
      }
      const newEnvironment = this.createEnvironment(environment, node, instructions);
      this.addNewEnvironment(newEnvironment);

      newEnvironment.executionState.type = 'memberUpdate';
      newEnvironment.executionState.phase = 'init';
      environment = newEnvironment;

      environment.returnValues.push(object);
      environment.returnValues.push([]); // array of properties such as [property1, property2, property3]
    }

    switch (environment.executionState.phase) {
      case 'init': { // interprets the property into a value
        const instruction = this.getNextInstruction();
        if (instruction === null) {
          environment.executionState.phase = 'end';
          break;
        }
        environment.executionState.phase = 'property';
        this.handleMemberProperty(instruction.property, instruction.computed);
        break;
      }
      case 'property': { // adds the property value to the properties array
        environment.executionState.phase = 'init';
        const init = environment.returnValues.pop();
        const property = init.value;
        const properties = [...environment.returnValues.pop(), property];
        environment.returnValues.push(properties);

        this.gotoNextInstruction();
        if (this.getNextInstruction() !== null) break;
      }
      case 'end': { // finds the value of the final property and updates it
        const properties = environment.returnValues.pop();
        const operator = node.operator;
        const object = environment.returnValues.pop();
        const identifier = (object.type === 'Identifier') ? object.name : null;

        let objectValue = this.lookupVariableValue(identifier, this.getCurrentEnvironment());
        let value = undefined;
        if (objectValue === null) {
          console.error(`Expression interpreter error: Variable ${identifier} not found`);
          this.updateCallback({ command: 'error', error: `Identifier '${identifier}' is not defined` });
        } else {
          for (let i = 0; i < properties.length; i++) {
            objectValue = objectValue[properties[i]];
          }
          
          value = objectValue;
          if (operator === '++') value++;
          else if (operator === '--') value--;
          else console.error("weird error, operator not found");
          
          this.updateVariableProperty(identifier, properties, value, this.getCurrentEnvironment()); // identifier[property[0]][property[1]][...] = value;
        }

        this.removeCurrentEnvironment();
        environment = this.getCurrentEnvironment();

        const returnValue = {
          value: (node.prefix) ? value : objectValue
        }
        environment.returnValues.push(returnValue);
        break;
      }
      default:
        console.error("unknown phase: " + environment.executionState.phase);
    }
  }

  handleUpdateVariableExpression(node) {
    this.updateCurrentExecutingNode(node.nodeId, node.type);

    const varName = node.argument.name;
    const operator = node.operator;
    const oldValue = this.lookupVariableValue(varName, this.getCurrentEnvironment());

    let value = oldValue;
    if (operator === '++') value++;
    else if (operator === '--') value--;
    else console.error("weird error, operator not found");

    this.updateVariableValue(varName, value, this.getCurrentEnvironment());

    const returnValue = {
      value: node.prefix ? value : oldValue
    }

    this.getCurrentEnvironment().returnValues.push(returnValue);
  }

  interpretCallExpression(node) {
    if (this.debugging) console.log("call expression");
    if (this.debugging) console.log(node);

    this.updateCurrentExecutingNode(node.nodeId, node.type);

    // TODO: merge this with the switch case
    const callee = node.callee;
    if (callee.type === 'MemberExpression') {
      // check if the function is a built-in function
      const standard = this.handleStandardFunctions(node);
      if (standard) return;
    }

    let environment = this.getCurrentEnvironment();
    if (environment.executionState.node !== node) {
      // Create a new environment for the function call's scope
      const instructions = node.arguments;
      const newEnvironment = this.createEnvironment(environment, node, instructions);
      this.addNewEnvironment(newEnvironment);

      newEnvironment.executionState.type = 'call';
      newEnvironment.executionState.phase = 'init';
      environment = newEnvironment;
    }

    const argumentDeclaration = this.getNextInstruction();

    const functionDeclaration = this.lookupFunction(node.callee.name);
    switch (environment.executionState.phase) {
      case 'init': { // TODO: unececssary phase, remove it
        if (argumentDeclaration === null) environment.executionState.phase = 'call';
        else environment.executionState.phase = 'argument';
        break;
      }
      case 'argument': {
        environment.executionState.phase = 'declare';
        this.interpretExpression(argumentDeclaration);
        break;
      }
      case 'declare': {
        environment.executionState.phase = 'init';
        const instructionPointer = environment.executionState.instructionPointer;
        const argument = environment.returnValues.pop();
        const argumentValue = argument.value;
        const parameter = functionDeclaration.parameters[instructionPointer];

        this.handleVariableCreation(argumentDeclaration.type, parameter.name, argumentValue, environment, argumentDeclaration.name);
        this.gotoNextInstruction();
        if (this.getNextInstruction() !== null) break;
      }
      case 'call': {
        // We set the parent environment of the function to the global environment to avoid giving it access to any variables other than the global ones
        // The reason we do it here is because we need to wait until we have declared all parameter values, which may rely on variables in the current environment
        environment.parentEnvironment = this.globalEnvironment;
        environment.executionState.phase = 'end';

        // check if any parameters are missing, if so we set them to undefined
        const parameters = functionDeclaration.parameters;
        const instructionPointer = environment.executionState.instructionPointer;
        for (let i = instructionPointer; i < parameters.length; i++) {
          const parameter = parameters[i];
          this.handleVariableCreation('Literal', parameter.name, undefined, environment);
        }

        this.interpretBlockStatement(functionDeclaration.body);  // interpret the body of the function
        break;
      }
      case 'end': {
        const call = environment.returnValues.pop();
        const callReturnValue = call ? call.value : undefined;
        this.removeCurrentEnvironment();
        environment = this.getCurrentEnvironment();
        environment.returnValues.push({ value: callReturnValue }); // pass the return value to the previous environment
        break;
      }
      default:
        console.error("unknown phase: " + environment.executionState.phase);
    }
  }

  handleStandardFunctions(node) {
    this.updateCurrentExecutingNode(node.nodeId, node.type);

    if (node.callee.type === 'MemberExpression') {
      if (node.callee.object.name === 'Math') {
        if (node.callee.property.name === 'max') {
          this.interpretMathMax(node);
          return true;
        } else if (node.callee.property.name === 'min') {
          this.interpretMathMin(node);
          return true;
        } else if (node.callee.property.name === 'abs') {
          this.interpretMathAbs(node);
          return true;
        } else if (node.callee.property.name === 'floor') {
          this.interpretMathFloor(node);
          return true;
        }
      } else if (node.callee.object.name === 'console') {
        if (node.callee.property.name === 'log') {
          this.interpretConsoleLog(node);
          return true;
        }
      } else if (node.callee.property.name === 'push') {
        this.interpretArrayPush(node);
        return true;
      }
    }
    return false;
  }
  
  interpretMemberExpression(node) {
    if (this.debugging) console.log("member expression");
    if (this.debugging) console.log(node);

    this.updateCurrentExecutingNode(node.nodeId, node.type);

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
        this.handleMemberProperty(node.property, node.computed);
        break;
      case 'end':
        const property = environment.returnValues.pop();
        const object = environment.returnValues.pop();

        this.removeCurrentEnvironment();
        environment = this.getCurrentEnvironment();

        const objectValue = object.value;
        const objectProperties = object.properties;
        const objectIdentifier = object.identifier;
        const propertyValue = property.value;
        const name = node.object.type === 'Identifier' ? node.object.name : objectIdentifier ? objectIdentifier : null;
        const properties = objectProperties ? [...objectProperties, propertyValue] : [propertyValue];

        // check if the property is not found in the object
        if (propertyValue !== 'length' && objectValue[propertyValue] === undefined) {
          console.error(`Expression interpreter error: Property ${propertyValue} not found in object`);
          this.updateCallback({ command: 'error', error: `Property '${propertyValue}' is not defined for '${objectValue}'` });
          environment.returnValues.push({ value: undefined });
          break;
        }

        // send update callback for accessing the variable member
        const variableScope = this.lookupVariableScope(name, environment);
        if (variableScope !== null) {
          this.updateCallback({ command: 'accessVariable', scopeId: variableScope.id, name: name, properties: properties });
        }

        const returnValue = {
          value: propertyValue === 'length' ? objectValue.length : objectValue[propertyValue],
          identifier: name,
          properties: properties,
        }

        environment.returnValues.push(returnValue);
        break;
      default:
        console.error("unknown phase: " + environment.executionState.phase);
    }
  }

  interpretConditionalExpression(node) {
    if (this.debugging) console.log("conditional expression");
    if (this.debugging) console.log(node);

    this.updateCurrentExecutingNode(node.nodeId, node.type);

    let environment = this.getCurrentEnvironment();
    if (environment.executionState.node !== node) {
      const instructions = [];
      const newEnvironment = this.createEnvironment(environment, node, instructions);
      this.addNewEnvironment(newEnvironment);

      newEnvironment.executionState.type = 'conditional';
      newEnvironment.executionState.phase = 'test';
      environment = newEnvironment;
    }

    switch (environment.executionState.phase) {
      case 'test':
        environment.executionState.phase = 'consequent';
        this.interpretExpression(node.test);
        break;
      case 'consequent':
        environment.executionState.phase = 'end';
        const test = environment.returnValues.pop();
        const testResult = test.value;
        if (testResult) {
          this.interpretExpression(node.consequent);
        } else {
          this.interpretExpression(node.alternate);
        }
        break;
      case 'end':
        const consequent = environment.returnValues.pop();
        const value = consequent.value;
        this.removeCurrentEnvironment();
        environment = this.getCurrentEnvironment();
        environment.returnValues.push({ value: value });
        break;
      default:
        console.error("unknown phase: " + environment.executionState.phase);
    }
  }

  interpretArrayPush(node) {
    if (this.debugging) console.log("array push");
    if (this.debugging) console.log(node);

    this.updateCurrentExecutingNode(node.nodeId, node.type);

    let environment = this.getCurrentEnvironment();
    if (environment.executionState.node !== node) {
      const instructions = [];
      const newEnvironment = this.createEnvironment(environment, node, instructions);
      this.addNewEnvironment(newEnvironment);

      newEnvironment.executionState.type = 'arrayPush';
      newEnvironment.executionState.phase = 'evaluate';
      environment = newEnvironment;
    }

    switch (environment.executionState.phase) {
      case 'evaluate':
        environment.executionState.phase = 'argument';
        this.interpretExpression(node.callee.object);
        break;
      case 'argument':
        environment.executionState.phase = 'end';
        this.interpretExpression(node.arguments[0]);
        break;
      case 'end':
        const argument = environment.returnValues.pop();
        const argumentValue = argument.value;
        const evaluate = environment.returnValues.pop();
        const value = evaluate.value;
        const identifier = node.callee.object.name;
        const result = [...value, argumentValue];
        const name = evaluate.identifier ? evaluate.identifier : identifier;
        const properties = evaluate.properties;
        this.removeCurrentEnvironment();

        if (properties) {
          this.updateVariableProperty(name, properties, result, this.getCurrentEnvironment());
        } else {
          this.updateVariableValue(identifier, result, this.getCurrentEnvironment());
        }

        environment.returnValues.push({ value: argumentValue });
        break;
      default:
        console.error("unknown phase: " + environment.executionState.phase);
    }
  }

  interpretObjectExpression(node) {
    if (this.debugging) console.log("object expression");
    if (this.debugging) console.log(node);

    this.updateCurrentExecutingNode(node.nodeId, node.type);

    let environment = this.getCurrentEnvironment();
    if (environment.executionState.node !== node) {
      const instructions = node.properties;
      const newEnvironment = this.createEnvironment(environment, node, instructions);
      this.addNewEnvironment(newEnvironment);

      newEnvironment.executionState.type = 'object';
      newEnvironment.executionState.phase = 'init';
      environment = newEnvironment;

      environment.returnValues.push({}); // new object
    }

    const property = this.getNextInstruction();
    switch (environment.executionState.phase) {
      case 'init': {
        if (property === null) {
          environment.executionState.phase = 'end';
        } else {
          environment.executionState.phase = 'evaluate';
          this.interpretExpression(property.value);
        }
        break;
      }
      case 'evaluate': {
        environment.executionState.phase = 'init';
        const init = environment.returnValues.pop();
        const value = init.value;
        const key = property.key.name;
        const object = environment.returnValues.pop();
        object[key] = value;
        environment.returnValues.push(object);
        this.gotoNextInstruction();
        if (this.getNextInstruction() !== null) break;
      }
      case 'end': {
        const object = environment.returnValues.pop();
        this.removeCurrentEnvironment();
        environment = this.getCurrentEnvironment();
        environment.returnValues.push({ value: object });
        break;
      }
      default:
        console.error("unknown phase: " + environment.executionState.phase);
    }
  }

  interpretArrayExpression(node) {
    if (this.debugging) console.log("array expression");
    if (this.debugging) console.log(node);

    this.updateCurrentExecutingNode(node.nodeId, node.type);

    let environment = this.getCurrentEnvironment();
    if (environment.executionState.node !== node) {
      const instructions = node.elements;
      const newEnvironment = this.createEnvironment(environment, node, instructions);
      this.addNewEnvironment(newEnvironment);

      newEnvironment.executionState.type = 'array';
      newEnvironment.executionState.phase = 'init';
      environment = newEnvironment;

      environment.returnValues.push([]); // array of values
    }

    const instruction = this.getNextInstruction();
    if (instruction === null) environment.executionState.phase = 'end';

    switch (environment.executionState.phase) {
      case 'init':
        environment.executionState.phase = 'evaluate';
        this.interpretExpression(instruction);
        break;
      case 'evaluate':
        environment.executionState.phase = 'init';
        const init = environment.returnValues.pop();
        const value = init.value;
        const array = [...environment.returnValues.pop(), value];
        environment.returnValues.push(array);
        
        this.gotoNextInstruction();
        if (this.getNextInstruction() !== null) break; // if this was the last element we go straight to end
      case 'end':
        const values = environment.returnValues.pop();
        this.removeCurrentEnvironment();
        environment = this.getCurrentEnvironment();
        environment.returnValues.push({ value: values });
        break;
      default:
        console.error("unknown phase: " + environment.executionState.phase);
    }
  }

  interpretSequenceExpression(node) {
    if (this.debugging) console.log("sequence expression");
    if (this.debugging) console.log(node);

    this.updateCurrentExecutingNode(node.nodeId, node.type);

    let environment = this.getCurrentEnvironment();
    if (environment.executionState.node !== node) {
      const instructions = node.expressions;
      const newEnvironment = this.createEnvironment(environment, node, instructions);
      this.addNewEnvironment(newEnvironment);

      newEnvironment.executionState.type = 'sequence';
      environment = newEnvironment;
    }

    const instruction = this.getNextInstruction();
    
    if (instruction === null) {
      this.removeCurrentEnvironment();
    } else {
      this.gotoNextInstruction();
      this.interpretExpression(instruction);
    }

    return null;
  }

  interpretVariableDeclaration(node) {
    if (this.debugging) console.log("variable declaration");
    if (this.debugging) console.log(node);

    this.updateCurrentExecutingNode(node.nodeId, node.type);

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
        environment.executionState.phase = 'declare';
        if (declaration.init !== null) this.interpretExpression(declaration.init);
        else environment.returnValues.push({ value: undefined });
        break;
      case 'declare':
        environment.executionState.phase = 'init';
        
        const varName = declaration.id.name;
        const parent = environment.parentEnvironment;
        const init = environment.returnValues.pop();
        const value = init.value;
        const varType = declaration.init !== null ? declaration.init.type : 'Literal';
        const identifier = declaration.init !== null ? declaration.init.name : null;

        this.handleVariableCreation(varType, varName, value, parent, identifier);

        this.gotoNextInstruction();
        if (this.getNextInstruction() !== null) break; // if this was the last declaration we go straight to end
      case 'end':
        this.removeCurrentEnvironment();
        break;
      default:
        console.error("unknown phase: " + environment.executionState.phase);
    }
  }

  handleVariableCreation(varType, varName, value, environment, identifier = null) {
    switch (varType) {
      case 'Literal':
      case 'BinaryExpression':
      case 'LogicalExpression':
      case 'UnaryExpression':
      case 'UpdateExpression':
        this.createVariable(varName, value, environment);
        break;
      case 'ArrayExpression':
        this.createArrayVariable(varName, value, environment);
        break;
      case 'ObjectExpression':
        this.createObjectVariable(varName, value, environment);
        break;
      case 'ConditionalExpression':
      case 'CallExpression':
      case 'MemberExpression':
        // check type of value and create the variable accordingly
        if (Array.isArray(value)) {
          this.createArrayVariable(varName, value, environment);
        } else if (typeof value === 'object') {
          this.createObjectVariable(varName, value, environment);
        } else {
          this.createVariable(varName, value, environment);
        }
        break;
      case 'Identifier':
        if (identifier === null) console.error("identifier was not provided");
        const varVal = this.lookupVariableValue(identifier, environment);
        if (varVal === null) {
          console.error("variable value not found");
        } else if (Array.isArray(varVal)) {
          this.createArrayVariable(varName, varVal, environment);
        } else if (typeof varVal === 'object') {
          this.createObjectVariable(varName, varVal, environment);
        } else {
          this.createVariable(varName, varVal, environment);
        }
        break;
      default:
        console.error(`Unrecognized variable type: ${varType}`);
    }
  }

  interpretFunctionDeclaration(node) {
    if (this.debugging) console.log("function declaration");
    if (this.debugging) console.log(node);

    this.updateCurrentExecutingNode(node.nodeId, node.type);

    const name = node.id.name;
    const parameters = node.params;
    const body = node.body;

    const functionDeclaration = this.createFunction(name, parameters, body);

    this.functionDeclarations.push(functionDeclaration);
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
    } else {
      this.gotoNextInstruction();
      this.executeNodeType(instruction);
    }
    
    return null;
  }

  interpretIfStatement(node) {
    if (this.debugging) console.log("if statement");
    if (this.debugging) console.log(node);

    this.updateCurrentExecutingNode(node.nodeId, node.type);

    let environment = this.getCurrentEnvironment();
    if (environment.executionState.node !== node) {
      const instructions = [];
      const newEnvironment = this.createEnvironment(environment, node, instructions);
      this.addNewEnvironment(newEnvironment);

      newEnvironment.executionState.type = 'if';
      newEnvironment.executionState.phase = 'test';
      environment = newEnvironment;
    }

    switch (environment.executionState.phase) {
      case 'test':
        environment.executionState.phase = 'consequent';
        this.interpretExpression(node.test);
        break;
      case 'consequent':
        environment.executionState.phase = 'end';
        const test = environment.returnValues.pop();
        const testResult = test.value;
        if (testResult) {
          this.executeNodeType(node.consequent);
        } else {
          if (node.alternate !== null) {
            this.executeNodeType(node.alternate);
          }
        }
        break;
      case 'end':
        this.removeCurrentEnvironment();
        break;
      default:
        console.error("unknown phase: " + environment.executionState.phase);
    }
  }

  interpretForStatement(node) {
    if (this.debugging) console.log("for statement");
    if (this.debugging) console.log(node);

    this.updateCurrentExecutingNode(node.nodeId, node.type);

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
        environment.executionState.phase = 'body';
        if (node.test !== null) this.interpretExpression(node.test);
        else environment.returnValues.push({ value: true }); // if there is no test, we assume it is true
        break;
      case 'body':
        const test = environment.returnValues.pop();
        const testResult = test.value;
        if (testResult) {
          environment.executionState.phase = 'update';
          this.executeNodeType(node.body); // interpret the body of the for loop
        } else {
          this.removeCurrentEnvironment(); // removes the for-loop environment
        }
        break;
      case 'update':
        environment.executionState.phase = 'test';
        this.interpretExpression(node.update);
        break;
      default:
        console.error("unknown phase: " + environment.executionState.phase);
    }
  }

  interpretWhileStatement(node) {
    if (this.debugging) console.log("while statement");
    if (this.debugging) console.log(node);

    this.updateCurrentExecutingNode(node.nodeId, node.type);

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
        environment.executionState.phase = 'body';
        this.interpretExpression(node.test)
        break;
      case 'body':
        const test = environment.returnValues.pop();
        const testResult = test.value;
        if (testResult) {
          environment.executionState.phase = 'test';
          this.executeNodeType(node.body); // interpret the body of the while loop
        } else {
          this.removeCurrentEnvironment(); // removes the while-loop environment
        }
        break;
      default:
        console.error("unknown phase: " + environment.executionState.phase);
    }
  }

  interpretDoWhileStatement(node) {
    if (this.debugging) console.log("do while statement");
    if (this.debugging) console.log(node);

    this.updateCurrentExecutingNode(node.nodeId, node.type);

    let environment = this.getCurrentEnvironment();
    if (environment.executionState.node !== node) {
      // Create a new environment for the do while loop's scope
      const instructions = [];
      const newEnvironment = this.createEnvironment(environment, node, instructions);
      this.addNewEnvironment(newEnvironment);

      newEnvironment.executionState.type = 'doWhile';
      newEnvironment.executionState.phase = 'body';
      newEnvironment.returnValues.push({ value: true }); // this is used to make sure the body is executed at least once
      environment = newEnvironment;
    }

    switch (environment.executionState.phase) {
      case 'test':
        environment.executionState.phase = 'body';
        this.interpretExpression(node.test)
        break;
      case 'body':
        const test = environment.returnValues.pop();
        const testResult = test.value;
        if (testResult) {
          environment.executionState.phase = 'test';
          this.executeNodeType(node.body); // interpret the body of the do while loop
        } else {
          this.removeCurrentEnvironment(); // removes the do while-loop environment
        }
        break;
      default:
        console.error("unknown phase: " + environment.executionState.phase);
    }
  }

  interpretSwitchStatement(node) {
    if (this.debugging) console.log("switch statement");
    if (this.debugging) console.log(node);

    this.updateCurrentExecutingNode(node.nodeId, node.type);

    let environment = this.getCurrentEnvironment();
    if (environment.executionState.node !== node) {
        const instructions = node.cases;
        const newEnvironment = this.createEnvironment(environment, node, instructions);
        this.addNewEnvironment(newEnvironment);
  
        newEnvironment.executionState.type = 'switch';
        newEnvironment.executionState.phase = 'discriminant';
        environment = newEnvironment;

        environment.returnValues.push(false); // found match or not
    }

    const caseNode = this.getNextInstruction();
    switch (environment.executionState.phase) {
      case 'discriminant': {
        environment.executionState.phase = 'cases';
        this.interpretExpression(node.discriminant);
        break;
      }
      case 'cases': {
        environment.executionState.phase = 'execute';
        if (caseNode === null) { // do we have any more cases?
          environment.executionState.phase = 'end';
          break;
        }

        const discriminant = environment.returnValues.pop();
        const foundMatch = environment.returnValues.pop();

        if (caseNode.test === null) { // is this default case?
          environment.returnValues.push({ value: true });          // found match is true
          environment.returnValues.push(discriminant);  // push discriminant back onto the stack
          environment.returnValues.push(discriminant);  // test will be discriminant (test === discriminant) to run consequent
        } else {
          environment.returnValues.push(foundMatch);
          environment.returnValues.push(discriminant);  // push discriminant back onto the stack
          this.interpretExpression(caseNode.test);
        }
        break;
      }
      case 'execute': {
        environment.executionState.phase = 'cases';
        const test = environment.returnValues.pop();
        const discriminant = environment.returnValues.pop();
        const foundMatch = environment.returnValues.pop();
        const testResult = test.value;
        const discriminantValue = discriminant.value;
        
        this.gotoNextInstruction();
        
        if (foundMatch || discriminantValue === testResult) {
          this.interpretSwitchCase(caseNode);             // interpret the body of the case
          environment.returnValues.push(true);            // found match is now true
          environment.returnValues.push(discriminant);    // push discriminant back onto the stack
        } else {
          environment.returnValues.push(foundMatch);
          environment.returnValues.push(discriminant);    // push discriminant back onto the stack
        }
        break;
      }
      case 'end': {
        this.removeCurrentEnvironment();
        break;
      }
      default:
        console.error("unknown phase: " + environment.executionState.phase);
    }
  }

  interpretSwitchCase(node) {
    if (this.debugging) console.log("switch case");
    if (this.debugging) console.log(node);

    this.updateCurrentExecutingNode(node.nodeId, node.type);

    let environment = this.getCurrentEnvironment();
    if (environment.executionState.node !== node) {
      const instructions = node.consequent;
      const newEnvironment = this.createEnvironment(environment, node, instructions);
      this.addNewEnvironment(newEnvironment);

      newEnvironment.executionState.type = 'switchCase';
      environment = newEnvironment;
    }

    const instruction = this.getNextInstruction();
    if (instruction !== null) {
      this.gotoNextInstruction();
      this.executeNodeType(instruction);
    } else {
      this.removeCurrentEnvironment();
    }
  }

  interpretBreakStatement(node) {
    if (this.debugging) console.log("break statement");
    if (this.debugging) console.log(node);

    this.updateCurrentExecutingNode(node.nodeId, node.type);

    let environment = this.getCurrentEnvironment();
    let type = environment.executionState.type;
    // purge all environments until we reach a statement that can handle a break
    // when a break occurs we should remove all environments including the first statement that can handle a break
    while (type !== 'global' && type !== 'for' && type !== 'while' && type !== 'doWhile' && type !== 'switch') {
      this.removeCurrentEnvironment();
      environment = this.getCurrentEnvironment();
      type = environment.executionState.type;
    }

    this.removeCurrentEnvironment();
  }

  interpretContinueStatement(node) {
    if (this.debugging) console.log("continue statement");
    if (this.debugging) console.log(node);

    this.updateCurrentExecutingNode(node.nodeId, node.type);

    let environment = this.getCurrentEnvironment();
    let type = environment.executionState.type;
    // purge all environments until we reach a statement that can handle a continue
    // when continue occurs we should remove all environment until we reach a loop but not remove the loop itself
    while (type !== 'global' && type !== 'for' && type !== 'while' && type !== 'doWhile') {
      this.removeCurrentEnvironment();
      environment = this.getCurrentEnvironment();
      type = environment.executionState.type;
    }
  }

  interpretReturnStatement(node) {
    if (this.debugging) console.log("return statement");
    if (this.debugging) console.log(node);

    this.updateCurrentExecutingNode(node.nodeId, node.type);

    let environment = this.getCurrentEnvironment();
    if (environment.executionState.node !== node) {
      const instructions = [];
      const newEnvironment = this.createEnvironment(environment, node, instructions);
      this.addNewEnvironment(newEnvironment);

      newEnvironment.executionState.type = 'return';
      newEnvironment.executionState.phase = 'evaluate';
      environment = newEnvironment;
    }

    switch (environment.executionState.phase) {
      case 'evaluate':
        environment.executionState.phase = 'end';
        this.interpretExpression(node.argument);
        break;
      case 'end':
        const evaluate = environment.returnValues.pop();
        const value = evaluate ? evaluate.value : undefined;

        // purge all environments until we reach a call environment which can handle a return
        let type = environment.executionState.type;
        while (type !== 'call') {
          this.removeCurrentEnvironment();
          environment = this.getCurrentEnvironment();
          type = environment.executionState.type;
        }

        environment = this.getCurrentEnvironment();
        environment.returnValues.push({ value: value }); // pass the return value to the parent environment
        break;
      default:
        console.error("unknown phase: " + environment.executionState.phase);
    }
  }

  /* STANDARD FUNCTIONS */

  interpretConsoleLog(node) {
    if (this.debugging) console.log("console log");
    if (this.debugging) console.log(node);

    this.updateCurrentExecutingNode(node.nodeId, node.type);

    let environment = this.getCurrentEnvironment();
    if (environment.executionState.node !== node) {
      const instructions = node.arguments;
      const newEnvironment = this.createEnvironment(environment, node, instructions);
      this.addNewEnvironment(newEnvironment);

      newEnvironment.executionState.type = 'consoleLog';
      newEnvironment.executionState.phase = 'init';
      environment = newEnvironment;
      
      environment.returnValues.push([]); // array of arguments
    }

    const instruction = this.getNextInstruction();

    if (instruction === null) {
      environment.executionState.phase = 'end';
    }

    switch (environment.executionState.phase) {
      case 'init': {
        environment.executionState.phase = 'log';
        this.interpretExpression(instruction);
        break;
      }
      case 'log': {
        environment.executionState.phase = 'init';
        const init = environment.returnValues.pop();
        const newArgument = init.value;
        const allArguments = environment.returnValues.pop();
        environment.returnValues.push([...allArguments, newArgument]);
        this.gotoNextInstruction();
        if (this.getNextInstruction() !== null) break;
      }
      case 'end': {
        this.removeCurrentEnvironment();
        const allArguments = environment.returnValues.pop();

        // Combine all arguments into a single string to be printed
        let resultPrintout = "";
        for (let i = 0; i < allArguments.length; i++) {
          const argument = allArguments[i];
          if (typeof argument === 'object') resultPrintout += JSON.stringify(argument);
          else resultPrintout += argument;
          
          if (i < allArguments.length - 1) resultPrintout += " ";
        }

        this.updateCallback({ command: 'consoleLog', argument: resultPrintout });
        break;
      }
      default:
        console.error("unknown phase: " + environment.executionState.phase);
    }
  }

  interpretMathMax(node) {
    if (this.debugging) console.log("math max");
    if (this.debugging) console.log(node);

    this.updateCurrentExecutingNode(node.nodeId, node.type);

    let environment = this.getCurrentEnvironment();
    if (environment.executionState.node !== node) {
      const instructions = [];
      const newEnvironment = this.createEnvironment(environment, node, instructions);
      this.addNewEnvironment(newEnvironment);

      newEnvironment.executionState.type = 'mathMax';
      newEnvironment.executionState.phase = 'argument1';
      environment = newEnvironment;
    }

    switch (environment.executionState.phase) {
      case 'argument1':
        environment.executionState.phase = 'argument2';
        this.interpretExpression(node.arguments[0]);
        break;
      case 'argument2':
        environment.executionState.phase = 'end';
        this.interpretExpression(node.arguments[1]);
        break;
      case 'end':
        const argument1 = environment.returnValues.pop();
        const argument2 = environment.returnValues.pop();
        const arg1Value = argument1.value;
        const arg2Value = argument2.value;
        const result = Math.max(arg1Value, arg2Value);
        this.removeCurrentEnvironment();
        environment = this.getCurrentEnvironment();
        environment.returnValues.push({ value: result });
        break;
      default:
        console.error("unknown phase: " + environment.executionState.phase);
    }
  }

  interpretMathMin(node) {
    if (this.debugging) console.log("math min");
    if (this.debugging) console.log(node);

    this.updateCurrentExecutingNode(node.nodeId, node.type);

    let environment = this.getCurrentEnvironment();
    if (environment.executionState.node !== node) {
      const instructions = [];
      const newEnvironment = this.createEnvironment(environment, node, instructions);
      this.addNewEnvironment(newEnvironment);

      newEnvironment.executionState.type = 'mathMin';
      newEnvironment.executionState.phase = 'argument1';
      environment = newEnvironment;
    }

    switch (environment.executionState.phase) {
      case 'argument1':
        environment.executionState.phase = 'argument2';
        this.interpretExpression(node.arguments[0]);
        break;
      case 'argument2':
        environment.executionState.phase = 'end';
        this.interpretExpression(node.arguments[1]);
        break;
      case 'end':
        const argument1 = environment.returnValues.pop();
        const argument2 = environment.returnValues.pop();
        const arg1Value = argument1.value;
        const arg2Value = argument2.value;
        const result = Math.min(arg1Value, arg2Value);
        this.removeCurrentEnvironment();
        environment = this.getCurrentEnvironment();
        environment.returnValues.push({ value: result });
        break;
      default:
        console.error("unknown phase: " + environment.executionState.phase);
    }
  }

  interpretMathAbs(node) {
    if (this.debugging) console.log("math abs");
    if (this.debugging) console.log(node);

    this.updateCurrentExecutingNode(node.nodeId, node.type);

    let environment = this.getCurrentEnvironment();
    if (environment.executionState.node !== node) {
      const instructions = [];
      const newEnvironment = this.createEnvironment(environment, node, instructions);
      this.addNewEnvironment(newEnvironment);

      newEnvironment.executionState.type = 'mathAbs';
      newEnvironment.executionState.phase = 'init';
      environment = newEnvironment;
    }

    switch (environment.executionState.phase) {
      case 'init':
        environment.executionState.phase = 'end';
        this.interpretExpression(node.arguments[0]);
        break;
      case 'end':
        const argument = environment.returnValues.pop();
        const argValue = argument.value;
        const result = Math.abs(argValue);
        this.removeCurrentEnvironment();
        environment = this.getCurrentEnvironment();
        environment.returnValues.push({ value: result });
        break;
      default:
        console.error("unknown phase: " + environment.executionState.phase);
    }
  }

  interpretMathFloor(node) {
    if (this.debugging) console.log("math floor");
    if (this.debugging) console.log(node);

    let environment = this.getCurrentEnvironment();
    if (environment.executionState.node !== node) {
      const instructions = [];
      const newEnvironment = this.createEnvironment(environment, node, instructions);
      this.addNewEnvironment(newEnvironment);

      newEnvironment.executionState.type = 'mathFloor';
      newEnvironment.executionState.phase = 'init';
      environment = newEnvironment;
    }

    switch (environment.executionState.phase) {
      case 'init':
        environment.executionState.phase = 'end';
        this.interpretExpression(node.arguments[0]);
        break;
      case 'end':
        const argument = environment.returnValues.pop();
        const argValue = argument.value;
        const result = Math.floor(argValue);
        this.removeCurrentEnvironment();
        environment = this.getCurrentEnvironment();
        environment.returnValues.push({ value: result });
        break;
      default:
        console.error("unknown phase: " + environment.executionState.phase);
    }
  }

}
