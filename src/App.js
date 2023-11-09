import React, { useEffect, useState } from 'react';
import './App.css';
import CodeInput from './components/CodeInput';
import build_ast from './modules/ASTBuilder';
import Variable from './components/Variable';
import Array from './components/Array';

function App() {
  const [code, setCode] = useState('var a = 1;');
  const [parsedCode, setParsedCode] = useState('');

  const [variables, setVariables] = useState([]); // [name, value]
  const [array_variables, setArrayVariables] = useState([]); // [name, [value, value, ...]]

  function process_code(code) {
    build_ast(code, setParsedCode, setVariables, setArrayVariables);
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
                <Array name={name} values={values} />
              );
            })
          }
        </div>
      }

      <button style={{width: '100px', height: '25px', margin: '0.5%'}} onClick={() => process_code(code) }>Parse Code</button>
      <CodeInput code={code} setCode={setCode} />
    </div>
  );
}

export default App;
