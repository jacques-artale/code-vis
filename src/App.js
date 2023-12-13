import React, { useEffect, useState } from 'react';
import './App.css';

import InterpretWorker from './workers/Interpreter.worker.js';

import buildAst from './modules/ASTBuilder';
import { Interpreter } from './modules/Interpreter';
import CodeInput from './components/CodeInput';
import Console from './components/Console';
import Variable from './components/Variable';
import ArrayGrid from './components/Array';

function App() {
  const [code, setCode] = useState('var a = [1,2,3,4];\n\nfor (var i = 0; i < 4; i++) {\n  a[i]++;\n}\n');

  const [variables, setVariables] = useState([]); // [[name, value], [name, value], ...]
  const [arrayVariables, setArrayVariables] = useState([]); // [[name, [value, value, ...]], [name, [value, value, ...]], ...]
  const [log, setLog] = useState([]); // [line, line, ...]

  const [worker, setWorker] = useState(null);

  const interpreter = new Interpreter(setVariables, setArrayVariables, setLog);
  
  // setup worker for interpreting code
  useEffect(() => {
    const newWorker = new InterpretWorker();
    setWorker(newWorker);

    newWorker.postMessage('Hello World!');
    newWorker.onmessage = (e) => {
      console.log('Message received from worker:', e.data);
    };

    return () => newWorker.terminate();
  }, []);

  function simulateCode() {
    const parsedCode = buildAst(code);
    
    if (parsedCode !== '') {
      setLog([]); // Clear the console
      interpreter.interpretParsedCode(parsedCode);
    }
  }

  return (
    <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'row'}}>
      {
        <div style={{width: '50%', display: 'flex', flexDirection: 'column'}}>
          {
            variables.map(([name, value]) => {
              return (
                <Variable name={name} value={value} />
              );
            })
          }
          {
            arrayVariables.map(([name, values]) => {
              return (
                <ArrayGrid name={name} values={values} />
              );
            })
          }
          <Console log={log} />
        </div>
      }

      <div style={{display: 'flex', flexDirection: 'column'}}>
        <button style={{width: '100px', height: '25px', margin: '0.5%'}} onClick={() => simulateCode() }>Run</button>
      </div>

      <CodeInput code={code} setCode={setCode} />
    </div>
  );
}

export default App;
