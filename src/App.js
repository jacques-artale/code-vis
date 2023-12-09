import React, { useState } from 'react';
import './App.css';
import build_ast from './modules/ASTBuilder';
import { Interpreter } from './modules/Interpreter';
import CodeInput from './components/CodeInput';
import Console from './components/Console';
import Variable from './components/Variable';
import ArrayGrid from './components/Array';

function App() {
  const [code, setCode] = useState('var a = [1,2,3,4];\n\nfor (var i = 0; i < 4; i++) {\n  a[i]++;\n}\n');

  const [variables, setVariables] = useState([]); // [[name, value], [name, value], ...]
  const [array_variables, setArrayVariables] = useState([]); // [[name, [value, value, ...]], [name, [value, value, ...]], ...]

  const [log, setLog] = useState([]); // [line, line, ...]

  const interpreter = new Interpreter(setVariables, setArrayVariables, setLog);

  function simulate_code() {
    const parsedCode = build_ast(code);
    
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
            array_variables.map(([name, values]) => {
              return (
                <ArrayGrid name={name} values={values} />
              );
            })
          }
          <Console log={log} />
        </div>
      }

      <div style={{display: 'flex', flexDirection: 'column'}}>
        <button style={{width: '100px', height: '25px', margin: '0.5%'}} onClick={() => simulate_code() }>Run</button>
      </div>

      <CodeInput code={code} setCode={setCode} />
    </div>
  );
}

export default App;
