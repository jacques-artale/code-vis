import React from 'react';
import MonacoEditor from 'react-monaco-editor';

class CodeEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      code: ""
    };
  }

  editorDidMount(editor, monaco) {
    console.log('editorDidMount', editor);
    editor.focus();
  }

  onChange(newValue, e) {
    console.log('onChange', newValue, e);
    this.setState({ code: newValue });
  }

  render() {
    const code = this.state.code;
    const options = {
      selectOnLineNumbers: true
    };
    return (
      <MonacoEditor
        width="100%"
        height="100%"
        language="javascript"
        theme="vs-dark"
        value={code}
        options={options}
        onChange={this.onChange.bind(this)}
        editorDidMount={this.editorDidMount.bind(this)}
      />
    );
  }
}

function CodeInput() {
  const code_editor = new CodeEditor();
  return (
    <div style={{float: 'right', width: '50%', height: '100%'}}>
      {
        code_editor.render()
      }
    </div>
  );
}

export default CodeInput;
