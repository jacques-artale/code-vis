import React from 'react';

import buildAst from '../modules/ASTBuilder';

const ASTView = ({ code }) => {

  function getAST() {
    try {
      const parsedCode = buildAst(code);
      return JSON.stringify(parsedCode);
    } catch (e) {
      const errorInfo = {
        message: e.message,
        stack: e.stack,
      };
      return JSON.stringify(errorInfo);
    }
  }

  return (
    <div style={
      {
        display: "flex",
        flexDirection: "column",
        overflow: "scroll",
        height: "80%",
        padding: "1%"
      }
    }>
      {
        getAST()
      }
    </div>
  );
}

export default ASTView;
