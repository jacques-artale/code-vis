import './App.css';
import CodeEditor from './components/CodeEditor';

function App() {

  let code_editor = new CodeEditor();

  return (
    <div style={{width: '100%', height: '100%'}}>
      <div style={{float: 'right', width: '50%', height: '100%'}}>
        {
          code_editor.render()
        }
      </div>
    </div>
  );
}

export default App;
