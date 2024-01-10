import { parseScript } from 'esprima';
import * as estraverse from 'estraverse';

export function buildAst(code) {
  try {
    const ast = parseScript(code, { loc: true });
    return { type: 'parsed', code: ast};
  } catch (e) {
    console.log("Error parsing code: ", e);
    return { type: 'error', description: e.description, line: e.lineNumber, column: e.column };
  }
}

export function getNodesToHighlight(node, nodesToFind = []) {
  let nodesToHighlight = [];
  estraverse.traverse(node, {
    enter: function(node) {
      if (nodesToFind.includes(node)) {
        nodesToHighlight.push(node.loc);
      }
    }
  });
  console.log(nodesToHighlight);
  return nodesToHighlight;
}
