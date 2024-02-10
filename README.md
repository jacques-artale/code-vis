# Code-vis
A visual representation of JavaScript programs

## Description
JavaScript Code Visualizer is an interactive tool designed to help developers understand JavaScript code execution visually. Paste or write JavaScript code into the visualizer to step through it incrementally. The visualizer interprets the code and generates corresponding React components to represent the code's behavior.

## Languages and Frameworks Used:
![My Skills](https://skillicons.dev/icons?i=js,html,css,react,webpack)

## Live-demo:
Give it a few seconds to wake up: https://code-vis-1671f11beee1.herokuapp.com/

## Installation:
1. Run `git clone [repository URL]`
2. Navigate to the project directory `cd code-vis/`
3. Install dependencies `npm install`

## To run:
#### Development:
1. `npm run dev` runs the app in the development mode
2. Open [http://localhost:8080](http://localhost:8080) to view it in your browser.
#### Production:
1. `npm build` builds the app for production
2. `npm start` runs the app in production mode
3. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Interpreter - Control:
- Pause/Execute
- Speed Control
- Step Forward

## ES6 Compatability - Supported and Pending Features:
### Currently Supported:
- ✅ Variable declarations (Primitive, Arrays, Objects)
- ✅ Variable assignment
- ✅ Function declarations
- ✅ Function calls
- ✅ Built-in functions (console.log, Math.max, Math.min, Math.abs, Math.floor)
- ✅ Return
- ✅ Binary expressions
- ✅ Unary expressions
- ✅ Update expressions (x++, x--)
- ✅ If statements
- ✅ For statements
- ✅ While statements
- ✅ Do-while statements
- ✅ Switch case
- ✅ Ternary operation
- ✅ Break & continue
### Pending Support:
- ❌ Arrow functions
- ❌ Promises & Async/Await
- ❌ Spread operator
- ❌ For-of statements
- ❌ Try-catch
- ❌ Classes
- ❌ Default Parameters

## Visual - Supported Features:
- ✅ View current executing instruction
- ✅ View variables and their corresponding values
- ✅ View arrays (1D, 2D, and up)
- ✅ Highlighting for variable access/modification
- ✅ View scopes
- ✅ View output from console
- ✅ View AST
