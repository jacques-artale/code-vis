import React, { useEffect, useState, useRef } from 'react';
import '../styles/App.css';

import InterpretWorker from './workers/Interpreter.worker.js';

import { buildAst, getNodesToHighlight } from './modules/ASTBuilder';
import CodeInput from './components/CodeInput';
import Console from './components/Console';
import ASTView from './components/ASTView';
import VisualView from './components/VisualView';
import ScriptSelect from './components/ScriptSelect.js';
import Slider from './components/Slider.js';
import ThemeButton from './components/ThemeButton.js';
import ExecutingInstruction from './components/ExecutingInstruction.js';

function App() {
  const interpreterSpeeds = [3000, 2000, 1500, 1000, 750, 500, 250, 100, 50, 25, 0];

  const [theme, setTheme] = useState('sketch');

  const [code, setCode] = useState('');
  const [parsedCode, setParsedCode] = useState(null);

  const [viewAST, setViewAST] = useState(false);
  const [showStart, setShowStart] = useState(true);
  const [showStop, setShowStop] = useState(false);
  const [showPause, setShowPause] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [interpretSpeed, setInterpretSpeed] = useState(5);        // index for `interpreterSpeeds` between interpreter calls
  const [desiredSpeed, setDesiredSpeed] = useState(5);            // index for `interpreterSpeeds` between interpreter calls

  const [scopes, setScopes] = useState([
    //{ id: 0, name: 'Global', variables: [], arrayVariables: [['a', [1,2,3,4,5]], ['b', [6,[1,2,3,4],8,9,10]], ['c', [[[1,2],3],[4],[5,[[6,7],8,9],10],[11,[12]]]   ]]}
  ]);                       // [{}, ...]
  const [log, setLog] = useState([]);                             // [line, line, ...]

  const [highlights, setHighlights] = useState([]);               // [[startLine, startColumn, endLine, endColumn], ...]
  const [activeNode, setActiveNode] = useState(null);             // { nodeId, type }
  const [updatedVariable, setUpdatedVariable] = useState(null);   // { scopeId, name, properties }
  const [createdVariable, setCreatedVariable] = useState(null);   // { scopeId, name }
  const [accessedVariable, setAccessedVariable] = useState(null); // { scopeId, name, properties }
  
  const interpreterRef = useRef();                            // interval which calls the interpreter
  const [worker, setWorker] = useState(null);                 // worker where the interpreter runs
  const [isExecuting, setIsExecuting] = useState(false);      // boolean for whether the interpreter is running
  
  // setup worker for interpreting code
  useEffect(() => {
    const newWorker = new InterpretWorker();
    setWorker(newWorker);

    newWorker.onmessage = (e) => {
      // handle messages from worker
      if (e.data.command === 'updateScopes') {
        setScopes(e.data.scopes);
      } else if (e.data.command === 'consoleLog') {
        setLog(old_log => [...old_log, e.data.argument]);
      } else if (e.data.command === 'updateActiveNode') {
        setActiveNode({ nodeId: e.data.nodeId, nodeType: e.data.nodeType });
        setUpdatedVariable(null);
        setCreatedVariable(null);
        setAccessedVariable(null);
      } else if (e.data.command === 'updatedVariable') {
        setUpdatedVariable({ scopeId: e.data.scopeId, name: e.data.name, properties: e.data.properties });
      } else if (e.data.command === 'createVariable') {
        setCreatedVariable({ scopeId: e.data.scopeId, name: e.data.name });
      } else if (e.data.command === 'accessVariable') {
        setAccessedVariable({ scopeId: e.data.scopeId, name: e.data.name, properties: e.data.properties });
      } else if (e.data.command === 'error') {
        handleStop();
        alert(e.data.error);
      } else if (e.data.command === 'end') {
        handleStop();
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

  useEffect(() => {
    if (isExecuting) {
      manageExecutionInterval(parsedCode, desiredSpeed, true);
    }
  }, [desiredSpeed, isExecuting, parsedCode]);



  function manageExecutionInterval(newCode, speed, shouldStart) {
    clearInterval(interpreterRef.current);

    if (shouldStart && newCode !== null) {
      const interval = setInterval(() => {
        if (worker) {
          worker.postMessage({ command: 'interpretNext', code: newCode });
        }
      }, interpreterSpeeds[speed]);

      interpreterRef.current = interval;
      setInterpretSpeed(speed);
    }
  }

  function resetInterpreter(newParsedCode) {
    setScopes([]);
    setLog([]);
    worker.postMessage({ command: 'resetInterpreter', code: newParsedCode });
  }

  function simulateNext() {
    if (parsedCode !== null) {
      worker.postMessage({ command: 'interpretNext', code: parsedCode });
    }
  }

  function handleStart() {
    const parsed = buildAst(code);
    if (parsed.type === 'error') {
      alert(`Error parsing code: ${parsed.description} at line ${parsed.line}, column ${parsed.column}`);
      return;
    }
    setParsedCode(parsed.code);
    resetInterpreter(parsed.code);
    manageExecutionInterval(parsed.code, desiredSpeed, true);
    
    setShowStart(false);
    setShowStop(true);
    setShowPause(true);
    setShowResume(false);
    setShowNext(true);
    setIsExecuting(true);
  }

  function handleStop() {
    manageExecutionInterval(null, 0, false);
    setHighlights([]);
    setActiveNode(null);
    setUpdatedVariable(null);
    setCreatedVariable(null);
    setAccessedVariable(null);

    setShowStart(true);
    setShowStop(false);
    setShowPause(false);
    setShowResume(false);
    setShowNext(false);
    setIsExecuting(false);
  }

  function handlePause() {
    manageExecutionInterval(null, interpretSpeed, false);

    setShowPause(false);
    setShowResume(true);
    setIsExecuting(false);
  }

  function handleResume() {
    manageExecutionInterval(parsedCode, desiredSpeed, true);

    setShowPause(true);
    setShowResume(false);
    setIsExecuting(true);
  }

  function handleNext() {
    simulateNext();
  }

  function toggleASTView() {
    setViewAST(oldValue => !oldValue);
  }

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'row' }} className={`${theme}-body`}>

      <div style={{ width: '50%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', width: '100%', height: '5%' }}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <button className={`${theme}-control-button`} style={{ display: showStart ? 'block' : 'none' }} onClick={() => handleStart() }>START</button>
            <button className={`${theme}-control-button`} style={{ display: showStop ? 'block' : 'none' }} onClick={() => handleStop() }>STOP</button>
            <button className={`${theme}-control-button`} style={{ display: showPause ? 'block' : 'none' }} onClick={() => handlePause() }>PAUSE</button>
            <button className={`${theme}-control-button`} style={{ display: showResume ? 'block' : 'none' }} onClick={() => handleResume() }>RESUME</button>
            <button className={`${theme}-control-button`} style={{ display: showNext ? 'block' : 'none' }} onClick={() => handleNext() }>NEXT</button>
            <button className={`${theme}-control-button`} onClick={() => toggleASTView() }>
              {
                viewAST ? 'VIEW VISUAL' : 'VIEW AST'
              }
            </button>
            <p>SPEED</p>
            <div style={{ width: '15%', height: '100%', marginLeft: '1%' }}>
              <Slider min={0} max={10} value={desiredSpeed} onInputChange={(value) => setDesiredSpeed(value)} theme={theme}/>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <ThemeButton theme={theme} setTheme={setTheme}/>
          </div>
        </div>
        <div style={{ display: 'flex', width: '100%', height: '3%' }}>
          <ExecutingInstruction theme={theme} activeNode={activeNode} />
        </div>
        <div style={{ display: 'flex', width: '100%', height: '70%' }}>
          {
            viewAST ?
              <ASTView code={code} /> :
              <VisualView scopes={scopes} theme={theme} varChange={updatedVariable} varCreate={createdVariable} varAccess={accessedVariable} />
          }
        </div>
        <div style={{ height: '22%' }}>
          <Console log={log} theme={theme}/>
        </div>
      </div>

      <div style={{ width: '50%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <ScriptSelect setCode={setCode} theme={theme}/>
        <CodeInput code={code} setCode={setCode} highlights={highlights} theme={theme}/>
      </div>
      
    </div>
  );
}

export default App;
