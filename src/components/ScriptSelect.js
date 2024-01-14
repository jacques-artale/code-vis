import React from 'react';
import scripts from '../utils/Scripts';

function ScriptSelect({ setCode }) {
  return (
    <div>
      {
        scripts.map((script, index) => (
          <button key={index} onClick={() => setCode(script.code)}>{script.name}</button>
        ))
      }
    </div>
  )
}

export default ScriptSelect;
