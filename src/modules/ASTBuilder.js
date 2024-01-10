import { parseScript } from 'esprima';
import * as estraverse from 'estraverse';

function assignASTIds(ast) {
  let id = 0;
  estraverse.traverse(ast, {
    enter: function(node) {
      node.nodeId = id++;
    }
  });
}

export function buildAst(code) {
  try {
    const ast = parseScript(code, { loc: true });
    assignASTIds(ast);
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
      if (nodesToFind.includes(node.nodeId)) {
        const { start, end } = node.loc;
        nodesToHighlight.push([start.line, start.column, end.line, end.column]);
      }
    }
  });
  return nodesToHighlight;
}
