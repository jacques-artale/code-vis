import React, { useEffect, useState } from 'react';
import './App.css';

import InterpretWorker from './workers/Interpreter.worker.js';

import buildAst from './modules/ASTBuilder';
import CodeInput from './components/CodeInput';
import Console from './components/Console';
import ASTView from './components/ASTView';
import VisualView from './components/VisualView';

function App() {
  const [code, setCode] = useState('var a = [1,2,3,4];\n\nfor (var i = 0; i < 4; i++) {\n  a[i]++;\n}\n');
  const [viewAST, setViewAST] = useState(false);

  const [variables, setVariables] = useState([]); // [[name, value], [name, value], ...]
  const [arrayVariables, setArrayVariables] = useState([]); // [[name, [value, value, ...]], [name, [value, value, ...]], ...]
  const [log, setLog] = useState([]); // [line, line, ...]

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

  function simulateCode() {
    const parsedCode = buildAst(code);
    
    if (parsedCode !== '') {
      setLog([]); // Clear the console
      worker.postMessage({ command: 'resetInterpreter', code: parsedCode });
      worker.postMessage({ command: 'interpretAll', code: parsedCode });
    }
  }

  function simulateNext() {
    const parsedCode = buildAst(code);

    if (parsedCode !== '') {
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
        <button style={{width: '100px', height: '25px', margin: '0.5%'}} onClick={() => simulateCode() }>Run</button>
        <button style={{width: '100px', height: '25px', margin: '0.5%'}} onClick={() => simulateNext() }>Next</button>
        <button style={{width: '100px', height: '25px', margin: '0.5%'}} onClick={() => toggleASTView() }>
          {
            viewAST ? 'View Visual' : 'View AST'
          }
        </button>
      </div>

      <CodeInput code={code} setCode={setCode} />
    </div>
  );
}

export default App;
