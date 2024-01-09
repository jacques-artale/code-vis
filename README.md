# Code-vis
A visual representation of JavaScript programs

## Description
JavaScript Code Visualizer is an interactive tool designed to help developers understand JavaScript code execution visually. Users can paste or write their JavaScript code into the visualizer to step through it incrementally. The visualizer interprets the code and generates corresponding React components to represent the code's behavior.

## Current Status
As of now, the project is in its initial development phase and includes:
- Integrated code editor using the Monaco editor: https://microsoft.github.io/monaco-editor/
- Parser and AST builder using Esprima: https://esprima.org/
- An interpreter for basic JavaScript capable of stepping through single instructions
- A foundational system for creating simple React components to represent variables

## Installation
1. Run `git clone [repository URL]`
2. Navigate to the project directory `cd code-vis/`
3. Install dependencies `npm install`

## To run
`npm start` runs the app in the development mode.\
Open [http://localhost:8080](http://localhost:8080) to view it in your browser.

## Interpreter - supported features
The following features are currently supported/unsupported:
- ✅ Variable declarations (Primitive, Arrays, Objects)
- ✅ Variable assignment
- ✅ Function declarations
- ✅ Function calls
- ✅ Built-in functions (console.log, Math.max, Math.min, Math.abs)
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
- ❌ Ternary operation
- ✅ Break & continue
- ❌ Classes

## Visual - supported features
- ✅ View variable values
- ✅ View arrays (1D & 2D)
- ✅ View output from console
- ✅ View AST
