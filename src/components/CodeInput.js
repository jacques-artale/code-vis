import React from 'react';
import { useEffect } from 'react';
import MonacoEditor from 'react-monaco-editor';

class CodeEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      code: props.code,
      editor: null,
      currentDecorations: [],
    };
  }

  editorDidMount(editor, monaco) {
    this.setState({ editor, monaco });
    editor.focus();

    monaco.editor.defineTheme('vs-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'highlight', foreground: '000000', background: 'ffff00' },
      ],
      colors: {
        'editor.background': '#fffafa',
      }
    });
  }

  onChange(newValue, e) {
    this.setState({ code: newValue });
    this.props.setCode(newValue);
  }

  setHighlights(highlights) {
    const { editor, currentDecorations } = this.state;
    if (editor) {
      const clearedDecorations = editor.deltaDecorations(currentDecorations, []);

      const decorations = highlights.map(highlight => ({
        range: new this.state.monaco.Range(highlight[0], highlight[1], highlight[2], highlight[3] + 1),
        options: { inlineClassName: 'highlight' }
      }));

      const newDecorations = editor.deltaDecorations(clearedDecorations, decorations);
      this.setState({ currentDecorations: newDecorations });
    }
  }

  render() {
    const code = this.state.code;
    const options = {
      selectOnLineNumbers: true,
      tabSize: 2,
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
      codeEditorRef.current.setState({ code }); // update the code in the editor
    }
  }, [code]);

  useEffect(() => {
    if (codeEditorRef.current) {
      codeEditorRef.current.setHighlights(highlights);
    }
  }, [highlights]);

  return (
    <div style={{ float: 'right', width: '100%', height: '100%' }}>
      <CodeEditor code={code} setCode={setCode} ref={codeEditorRef}/>
    </div>
  );
}

export default CodeInput;
