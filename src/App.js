import React, { useEffect, useState, useRef } from 'react';
import './App.css';

import InterpretWorker from './workers/Interpreter.worker.js';

import { buildAst, getNodesToHighlight } from './modules/ASTBuilder';
import CodeInput from './components/CodeInput';
import Console from './components/Console';
import ASTView from './components/ASTView';
import VisualView from './components/VisualView';

function App() {
  const [code, setCode] = useState(
`function hello() {
  for (let i = 0; i < 5; i++) {
    console.log(i);
  }
}
  
var a = 10;
var b = 5;
  
if (a === b * 2) {
  hello();
  console.log("equal!");
} else {
  console.log("not equal!");
}
`);
  const [parsedCode, setParsedCode] = useState(null);

  const [viewAST, setViewAST] = useState(false);

  const [variables, setVariables] = useState([]);             // [[name, value], [name, value], ...]
  const [arrayVariables, setArrayVariables] = useState([]);   // [[name, [value, value, ...]], [name, [value, value, ...]], ...]
  const [log, setLog] = useState([]);                         // [line, line, ...]

  const [highlights, setHighlights] = useState([]);           // [[startLine, startColumn, endLine, endColumn], ...]
  const [activeNode, setActiveNode] = useState(null);         // nodeId
  const [interpretSpeed, setInterpretSpeed] = useState(500);  // ms timer between interpreter calls
  
  const interpreterRef = useRef();                            // interval which calls the interpreter
  const [worker, setWorker] = useState(null);                 // worker where the interpreter runs
  
  // setup worker for interpreting code
  useEffect(() => {
    const newWorker = new InterpretWorker();
    setWorker(newWorker);

    newWorker.onmessage = (e) => {
      // handle messages from worker
      if (e.data.command === 'updateVariables') {
        setVariables(e.data.variables);
        setArrayVariables(e.data.arrayVariables);
      } else if (e.data.command === 'consoleLog') {
        setLog(old_log => [...old_log, e.data.argument]);
      } else if (e.data.command === 'updateActiveNode') {
        setActiveNode(e.data.nodeId);
      } else if (e.data.command === 'end') {
        clearInterval(interpreterRef.current);
      }
    };

    return () => newWorker.terminate();
  }, []);

  useEffect(() => {
    if (activeNode !== null) {
      const nodesToHighlight = getNodesToHighlight(parsedCode, [activeNode]);
      setHighlights(nodesToHighlight);
    }
  }, [activeNode, parsedCode]);

  function parseCode() {
    const parsedCode = buildAst(code);
    if (parsedCode.type === 'error') {
      alert(`Error parsing code: ${parsedCode.description} at line ${parsedCode.line}, column ${parsedCode.column}`);
      return;
    }
    
    setParsedCode(parsedCode.code);
  }

  function simulateCode() {    
    if (parsedCode !== null) {
      setLog([]); // Clear the console
      worker.postMessage({ command: 'resetInterpreter', code: parsedCode });

      const interval = setInterval(() => {
        if (worker === null) clearInterval(interval);
        else worker.postMessage({ command: 'interpretNext', code: parsedCode });
      }, interpretSpeed);

      interpreterRef.current = interval;
    }
  }

  function simulateNext() {
    if (parsedCode !== null) {
      worker.postMessage({ command: 'interpretNext', code: parsedCode });
    }
  }

  function toggleASTView() {
    setViewAST(oldValue => !oldValue);
  }

  return (
    <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'row'}}>

      <div style={{ width: '50%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{display: 'flex'}}>
          <button style={{width: '100px', height: '25px', margin: '0.5%'}} onClick={() => parseCode() }>Parse</button>
          <button style={{width: '100px', height: '25px', margin: '0.5%'}} onClick={() => simulateCode() }>Run</button>
          <button style={{width: '100px', height: '25px', margin: '0.5%'}} onClick={() => simulateNext() }>Next</button>
          <button style={{width: '100px', height: '25px', margin: '0.5%'}} onClick={() => toggleASTView() }>
            {
              viewAST ? 'View Visual' : 'View AST'
            }
          </button>
        </div>
        <div style={{width: '100%', height: '100%', display: 'flex'}}>
          {
            viewAST ?
              <ASTView code={code} /> :
              <VisualView variables={variables} arrayVariables={arrayVariables} />
          }
        </div>
        <Console log={log} />
      </div>

      <div style={{ width: '50%', height: '100%', display: 'flex' }}>
        <CodeInput code={code} setCode={setCode} highlights={highlights}/>
      </div>
      
    </div>
  );
}

export default App;
