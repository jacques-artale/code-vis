import React, { useState } from 'react';
import scripts from '../utils/Scripts';

function ScriptSelect({ setCode }) {
  const [selectedScript, setSelectedScript] = useState(null);
  
  return (
    <div style={{ display: 'flex' }}>
      {
        scripts.map((script, index) => (
          <button
            className={`script-select-button${selectedScript === script ? '-active' : ''}`}
            key={index}
            onClick={() => { setSelectedScript(script); setCode(script.code) }}
          >
            {script.name}
          </button>
        ))
      }
    </div>
  )
}

export default ScriptSelect;
