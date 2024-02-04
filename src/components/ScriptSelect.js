import React, { useState } from 'react';
import './../../styles/ScriptSelect.css';
import scripts from '../utils/Scripts';

function ScriptSelect({ setCode, theme }) {
  const [selectedScript, setSelectedScript] = useState(null);
  
  return (
    <div style={{ display: 'flex' }}>
      {
        scripts.map((script, index) => (
          <button
            className={`${theme}-script-select-button${selectedScript === script ? '-active' : ''}`}
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
