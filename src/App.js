import React, { useEffect, useState } from 'react';
import './App.css';
import build_ast from './modules/ASTBuilder';
import interpretParsedCode from './modules/Interpreter';
import CodeInput from './components/CodeInput';
import Variable from './components/Variable';
import ArrayGrid from './components/Array';

function App() {
  const [code, setCode] = useState('var a = [1,2,3,4];');
  const [parsedCode, setParsedCode] = useState('');

  const [variables, setVariables] = useState([]); // [name, value]
  const [array_variables, setArrayVariables] = useState([]); // [name, [value, value, ...]]

  function process_code(code) {
    build_ast(code, setParsedCode, setVariables, setArrayVariables);
  }

  function simulate_code() {
    if (parsedCode !== '') {
      interpretParsedCode(parsedCode);
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
        </div>
      }

      <div style={{display: 'flex', flexDirection: 'column'}}>
        <button style={{width: '100px', height: '25px', margin: '0.5%'}} onClick={() => process_code(code) }>Parse Code</button>
        <button style={{width: '100px', height: '25px', margin: '0.5%'}} onClick={() => simulate_code() }>Run</button>
      </div>

      <CodeInput code={code} setCode={setCode} />
    </div>
  );
}

export default App;
