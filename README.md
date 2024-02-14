# Code-vis
JavaScript Code Visualizer is an interactive tool designed to help developers understand JavaScript code execution visually. Paste or write JavaScript code into the visualizer to step through it incrementally. The visualizer interprets the code and generates corresponding React components to represent the code's behavior.

## Languages and Frameworks Used
![My Skills](https://skillicons.dev/icons?i=js,html,css,react,webpack,docker)

## Live-demo
A live version can be found at: https://www.code-vis.io/

## Prerequisites
Before you begin, ensure you have met the following requirements:
- You have installed the latest version of `node.js`
- You have installed the latest version of `npm`
- You have a Linux machine (not tested on Windows/macOS)
- You have `Docker` installed (Optional)

## Installing Code-Vis
1. Run `git clone https://github.com/jacques-artale/code-vis.git`
2. Navigate to the project directory `cd code-vis/`
3. Install dependencies `npm install`

## Available Scripts
#### Development:
1. `npm run dev` runs the app in the development mode
2. Open [http://localhost:8080](http://localhost:8080) to view it in your browser.
#### Production:
1. `npm run build` builds the app for production
2. `npm run start` runs the app in production mode
3. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
#### Docker:
1. `npm run docker:build` builds a docker-image from the application
2. `npm run docker:run` creates a running container from the image
3. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
#### Test:
1. `npm run test` runs the tests using Jest

## ES6 Compatability - Supported and Pending Features
| Currently Supported | Pending Support |
|----------|----------|
|✅ Variable declarations (Primitive, Arrays, Objects)|❌ Arrow functions|
|✅ Variable assignment|❌ Promises & Async/Await|
|✅ Function declarations|❌ Spread operator|
|✅ Function calls|❌ For-of statements|
|✅ Return|❌ Classes|
|✅ Binary expressions|❌ Default Parameters|
|✅ Unary expressions|❌ Map function|
|✅ Update expressions (x++, x--)||❌ Try-catch|
|✅ If statements||
|✅ For statements||
|✅ While statements||
|✅ Do-while statements||
|✅ Switch case||
|✅ Ternary operation||
|✅ Break & continue||
|✅ Built-in functions:<ul><li>console.log</li><li>Math.max</li><li>Math.min</li><li>Math.abs</li><li>Math.floor</li></ul>||

## Visual - Supported Features
- ✅ View current executing instruction
- ✅ View variables and their corresponding values
- ✅ View arrays (1D, 2D, and up)
- ✅ Highlighting for variable creation/access/modification
- ✅ View scopes
- ✅ View output from console
- ✅ View AST
