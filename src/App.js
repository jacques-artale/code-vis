import React, { useEffect, useState } from 'react';
import './App.css';
import CodeInput from './components/CodeInput';
import parse_code from './modules/ASTBuilder';

function App() {
  const [code, setCode] = useState('var a = 1;');
  const [parsedCode, setParsedCode] = useState('');

  return (
    <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'row'}}>
      <p style={{width: '50%', display: 'flex', flexDirection: 'column'}}>
        {
          parsedCode
        }
      </p>

      <button style={{width: '100px', height: '25px', margin: '0.5%'}} onClick={() => setParsedCode(parse_code(code)) }>Parse Code</button>
      <CodeInput code={code} setCode={setCode} />
    </div>
  );
}

export default App;
