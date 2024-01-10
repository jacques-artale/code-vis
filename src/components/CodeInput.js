import React from 'react';
import { useEffect } from 'react';
import MonacoEditor from 'react-monaco-editor';

class CodeEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      code: props.code,
      editor: null
    };
  }

  editorDidMount(editor, monaco) {
    this.setState({ editor, monaco });
    editor.focus();
  }

  onChange(newValue, e) {
    this.setState({ code: newValue });
    this.props.setCode(newValue);
  }

  setHighlights(highlights) {
    const { editor } = this.state;
    if (editor) {
      const decorations = highlights.map(highlight => ({
        range: new this.state.monaco.Range(highlights[0], highlight[1], highlight[2], highlight[3]),
        options: { inlineClassName: 'highlight' }
      }));
      editor.deltaDecorations([], decorations);
    }
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
        theme="vs-light"
        value={code}
        options={options}
        onChange={this.onChange.bind(this)}
        editorDidMount={this.editorDidMount.bind(this)}
      />
    );
  }
}

function CodeInput({ code, setCode, highlights }) {
  const codeEditorRef = React.useRef(null);

  useEffect(() => {
    if (codeEditorRef.current) {
      codeEditorRef.current.setHighlights(highlights);
    }
  }, [highlights]);

  return (
    <div style={{ float: 'right', width: '50%', height: '100%', border: '1px solid black' }}>
      <CodeEditor code={code} setCode={setCode} ref={codeEditorRef}/>
    </div>
  );
}

export default CodeInput;
