import React from 'react';

function ExecutingInstruction ({ activeNode, theme }) {

  function renderInstruction() {
    return (
      <div style={{ display: 'flex' }}>
        <p>CURRENT INSTRUCTION:</p>
        <p>{ activeNode.nodeType }</p>
        {
          /*
          <p>{'\u2192'}</p>
          <p>
            {
              // show evaluation of expression
            }
          </p>
          */
        }
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      { activeNode ? renderInstruction() : <p>SELECT A SCRIPT AND PRESS 'START'</p> }
    </div>
  )
}

export default ExecutingInstruction;