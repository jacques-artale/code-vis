import React from 'react';

import buildAst from '../modules/ASTBuilder';

const ASTView = ({ code }) => {

  function getAST() {
    try {
      const parsedCode = buildAst(code);
      if (parsedCode.type === 'error') {
        return JSON.stringify(parsedCode, null, 4);
      }
      return JSON.stringify(parsedCode.code, null, 4);
    } catch (e) {
      const errorInfo = {
        message: e.message,
        stack: e.stack,
      };
      return JSON.stringify(errorInfo, null, 4);
    }
  }

  return (
    <div style={
      {
        display: "flex",
        flexDirection: "column",
        overflow: "scroll",
        height: "76%",
        padding: "1%",
        whiteSpace: "pre-wrap"
      }
    }>
      {
        getAST()
      }
    </div>
  );
}

export default ASTView;
