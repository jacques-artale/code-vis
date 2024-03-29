import React from 'react';

import { buildAst } from '../modules/ASTBuilder';

const ASTView = ({ code }) => {

  function getAST() {
    try {
      const parsedCode = buildAst(code, false);
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
        height: "100%",
        width: "100%",
        marginLeft: "1%",
        marginBottom: "1%",
        marginTop: "1%",
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
