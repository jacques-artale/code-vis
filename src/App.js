import React, { useEffect, useState } from 'react';
import './App.css';

import InterpretWorker from './workers/Interpreter.worker.js';

import { buildAst, getNodesToHighlight } from './modules/ASTBuilder';
import CodeInput from './components/CodeInput';
import Console from './components/Console';
import ASTView from './components/ASTView';
import VisualView from './components/VisualView';

function App() {
  const [code, setCode] = useState(`var hello = 10;\nswitch (101) {\n  case 100:\n    hello = 23;\n    break;\n  case 2:\n    hello = 0;\n    break;\n  default:\n    hello = 32;\n}`);
  const [parsedCode, setParsedCode] = useState(null);

  const [viewAST, setViewAST] = useState(false);

  const [variables, setVariables] = useState([]); // [[name, value], [name, value], ...]
  const [arrayVariables, setArrayVariables] = useState([]); // [[name, [value, value, ...]], [name, [value, value, ...]], ...]
  const [log, setLog] = useState([]); // [line, line, ...]
  const [highlights, setHighlights] = useState([]); // [[startLine, startColumn, endLine, endColumn], ...]
  const [activeNode, setActiveNode] = useState(null); // [startLine, startColumn, endLine, endColumn]

  const [worker, setWorker] = useState(null);
  
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
      worker.postMessage({ command: 'interpretAll', code: parsedCode });
    }
    setHighlights([[1,0,1,10]]);
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
      {
        <div style={{width: '50%', display: 'flex', flexDirection: 'column'}}>
          {
            viewAST ?
              <ASTView code={code} /> :
              <VisualView variables={variables} arrayVariables={arrayVariables} />
          }
          <Console log={log} />
        </div>
      }

      <div style={{display: 'flex', flexDirection: 'column'}}>
        <button style={{width: '100px', height: '25px', margin: '0.5%'}} onClick={() => parseCode() }>Parse</button>
        <button style={{width: '100px', height: '25px', margin: '0.5%'}} onClick={() => simulateCode() }>Run</button>
        <button style={{width: '100px', height: '25px', margin: '0.5%'}} onClick={() => simulateNext() }>Next</button>
        <button style={{width: '100px', height: '25px', margin: '0.5%'}} onClick={() => toggleASTView() }>
          {
            viewAST ? 'View Visual' : 'View AST'
          }
        </button>
      </div>

      <CodeInput code={code} setCode={setCode} highlights={highlights}/>
    </div>
  );
}

export default App;
