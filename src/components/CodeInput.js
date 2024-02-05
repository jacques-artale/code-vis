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
      theme: props.theme,
    };
  }

  editorDidMount(editor, monaco) {
    this.setState({ editor, monaco });
    editor.focus();
  
    const vsTheme = this.props.theme === 'sketch' ? 'vs-light' : 'vs-dark';
    monaco.editor.defineTheme(vsTheme, {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'highlight', foreground: '000000', background: 'ffff00' },
      ],
      colors: {
        'editor.background': this.props.theme === 'sketch' ? '#f5e8df' : '#212529',
        'editor.lineHighlightBackground': this.props.theme === 'sketch' ? '#eadbd1' : '#313538',
        'editorLineNumber.foreground': this.props.theme === 'sketch' ? '#062746' : '#f5e8df',
        'editorLineNumber.activeForeground': 'red',
        'editor.foreground': this.props.theme === 'sketch' ? '#062746' : '#f5e8df',
        'editorCursor.foreground': this.props.theme === 'sketch' ? '#062746' : '#f5e8df',
      }
    });
    editor.updateOptions({ theme: vsTheme });
  }

  componentDidUpdate(prevProps) {
    if (this.props.theme !== prevProps.theme) {
      const vsTheme = this.props.theme === 'sketch' ? 'vs-light' : 'vs-dark';
      this.state.monaco.editor.defineTheme(vsTheme, {
        base: 'vs',
        inherit: true,
        rules: [
          { token: 'highlight', foreground: '000000', background: 'ffff00' },
        ],
        colors: {
          'editor.background': this.props.theme === 'sketch' ? '#f5e8df' : '#212529',
          'editor.lineHighlightBackground': this.props.theme === 'sketch' ? '#eadbd1' : '#313538',
          'editorLineNumber.foreground': this.props.theme === 'sketch' ? '#062746' : '#f5e8df',
          'editorLineNumber.activeForeground': 'red',
          'editor.foreground': this.props.theme === 'sketch' ? '#062746' : '#f5e8df',
          'editorCursor.foreground': this.props.theme === 'sketch' ? '#062746' : '#f5e8df',
        }
      });
      this.state.editor.updateOptions({ theme: vsTheme });
    }
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
        options: { inlineClassName: `${this.props.theme}-highlight` }
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
    const vsTheme = this.props.theme === 'sketch' ? 'vs-light' : 'vs-dark';
    return (
      <MonacoEditor
        width="100%"
        height="100%"
        language="javascript"
        theme={vsTheme}
        value={code}
        options={options}
        onChange={this.onChange.bind(this)}
        editorDidMount={this.editorDidMount.bind(this)}
      />
    );
  }
}

function CodeInput({ code, setCode, highlights, theme }) {
  const codeEditorRef = React.useRef(null);

  useEffect(() => {
    if (codeEditorRef.current) {
      codeEditorRef.current.setState({ code }); // update the code in the editor
    }
  }, [code]);

  useEffect(() => {
    if (codeEditorRef.current) {
      codeEditorRef.current.setState({ theme });
      codeEditorRef.current.setHighlights(highlights);
    }
  }, [theme, highlights]);

  return (
    <div style={{ float: 'right', width: '100%', height: '100%' }}>
      <CodeEditor code={code} setCode={setCode} ref={codeEditorRef} theme={theme}/>
    </div>
  );
}

export default CodeInput;
