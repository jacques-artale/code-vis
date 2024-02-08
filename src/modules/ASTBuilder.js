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

export function buildAst(code, useLoc = true) {
  try {
    const ast = parseScript(code, { loc: useLoc });
    assignASTIds(ast);
    return { type: 'parsed', code: ast};
  } catch (e) {
    console.log("Error parsing code: ", e);
    return { type: 'error', description: e.description, line: e.lineNumber, column: e.column };
  }
}

export function getNodesToHighlight(node, nodesToFind = []) {
  let nodesToHighlight = [];
  let nodesToFindIds = nodesToFind.map(n => n.nodeId); // Extract nodeIds from nodesToFind
  estraverse.traverse(node, {
    enter: function(node) {
      if (nodesToFindIds.includes(node.nodeId)) {
        const { start, end } = node.loc;
        nodesToHighlight.push([start.line, start.column, end.line, end.column]);
      }
    }
  });
  return nodesToHighlight;
}
