import React, { useEffect, useState } from 'react';
import './App.css';
import CodeInput from './components/CodeInput';
import parse_code from './modules/ASTBuilder';
import Variable from './components/Variable';

function App() {
  const [code, setCode] = useState('var a = 1;');
  const [parsedCode, setParsedCode] = useState('');

  const [variables, setVariables] = useState([]); // [name, value]

  useEffect(() => {
    // create components
    // if variable declared, add value to variables array
    
    setVariables(variables => {
      const exists = variables.some(([name, _]) => name === "var1");
      if (!exists) return [...variables, ["var1", 23]];
      return variables;
    });
  }, [parsedCode]);

  return (
    <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'row'}}>
      {
        <div style={{width: '50%', display: 'flex', flexDirection: 'column'}}>
          <p>
            {
              parsedCode
            }
          </p>
          {
            variables.map(([name, value]) => {
              return (
                <Variable name={name} value={value} />
              );
            })
          }
        </div>
      }

      <button style={{width: '100px', height: '25px', margin: '0.5%'}} onClick={() => setParsedCode(parse_code(code)) }>Parse Code</button>
      <CodeInput code={code} setCode={setCode} />
    </div>
  );
}

export default App;
