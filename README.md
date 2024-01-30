# Code-vis
A visual representation of JavaScript programs

## Description
JavaScript Code Visualizer is an interactive tool designed to help developers understand JavaScript code execution visually. Users can paste or write their JavaScript code into the visualizer to step through it incrementally. The visualizer interprets the code and generates corresponding React components to represent the code's behavior.

## Current Status
As of now, the project is in its initial development phase and includes:
- Integrated code editor using the Monaco editor: https://microsoft.github.io/monaco-editor/
- Parser and AST builder using Esprima: https://esprima.org/
- An interpreter for basic JavaScript capable of executing scripts
- A visual view of simple React components to represent variables

## Live-demo
Give it a few seconds to wake up: https://code-vis-1671f11beee1.herokuapp.com/

## Installation
1. Run `git clone [repository URL]`
2. Navigate to the project directory `cd code-vis/`
3. Install dependencies `npm install`

## To run
#### Development
1. `npm dev` runs the app in the development mode\
2. Open [http://localhost:8080](http://localhost:8080) to view it in your browser.
#### Production
1. `npm build` builds the app for production\
2. `npm start` runs the app in production mode\
3. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Interpreter - supported features
The following features are currently supported/unsupported:
- ✅ Variable declarations (Primitive, Arrays, Objects)
- ✅ Variable assignment
- ✅ Function declarations
- ✅ Function calls
- ✅ Built-in functions (console.log, Math.max, Math.min, Math.abs, Math.floor)
- ❌ Arrow functions
- ❌ Promises & Async/Await
- ✅ Return
- ✅ Binary expressions
- ✅ Unary expressions
- ✅ Update expressions (x++, x--)
- ❌ Spread operator
- ✅ If statements
- ✅ For statements
- ✅ While statements
- ✅ Do-while statements
- ✅ Switch case
- ❌ Try-catch
- ✅ Ternary operation
- ✅ Break & continue
- ❌ Classes

## Visual - supported features
- ✅ See which instruction is currently executing
- ✅ View variables and their values
- ✅ View arrays (1D & 2D)
- ✅ View scopes
- ✅ View output from console
- ✅ View AST
