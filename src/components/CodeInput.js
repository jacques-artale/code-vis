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

    const rootStyles = getComputedStyle(document.documentElement);
    const white = rootStyles.getPropertyValue('--white').trim();
    const darkBlue = rootStyles.getPropertyValue('--dark-blue').trim();
    const black = rootStyles.getPropertyValue('--black').trim();

    const vsTheme = this.props.theme === 'sketch' ? 'vs-light' : 'vs-dark';
    const themeBase = this.props.theme === 'sketch' ? 'vs' : 'vs-dark';
    monaco.editor.defineTheme(vsTheme, {
      base: themeBase,
      inherit: true,
      rules: [
        { token: 'highlight', foreground: '000000', background: 'ffff00' },
      ],
      colors: {
        'editor.background': this.props.theme === 'sketch' ? white : black,
        'editor.lineHighlightBackground': this.props.theme === 'sketch' ? '#eadbd1' : '#313538',
        'editorLineNumber.foreground': this.props.theme === 'sketch' ? darkBlue : white,
        'editorLineNumber.activeForeground': 'red',
        'editor.foreground': this.props.theme === 'sketch' ? darkBlue : white,
        'editorCursor.foreground': this.props.theme === 'sketch' ? darkBlue : white,
      }
    });
    editor.updateOptions({ theme: vsTheme });

    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize = () => {
    if (this.state.editor) {
      this.state.editor.layout();
    }
  }

  componentDidUpdate(prevProps) {
    const rootStyles = getComputedStyle(document.documentElement);
    const white = rootStyles.getPropertyValue('--white').trim();
    const darkBlue = rootStyles.getPropertyValue('--dark-blue').trim();
    const black = rootStyles.getPropertyValue('--black').trim();

    if (this.props.theme !== prevProps.theme) {
      const vsTheme = this.props.theme === 'sketch' ? 'vs-light' : 'vs-dark';
      const themeBase = this.props.theme === 'sketch' ? 'vs' : 'vs-dark';
      this.state.monaco.editor.defineTheme(vsTheme, {
        base: themeBase,
        inherit: true,
        rules: [
          { token: 'highlight', foreground: '000000', background: 'ffff00' },
        ],
        colors: {
          'editor.background': this.props.theme === 'sketch' ? white : black,
          'editor.lineHighlightBackground': this.props.theme === 'sketch' ? '#eadbd1' : '#313538',
          'editorLineNumber.foreground': this.props.theme === 'sketch' ? darkBlue : white,
          'editorLineNumber.activeForeground': 'red',
          'editor.foreground': this.props.theme === 'sketch' ? darkBlue : white,
          'editorCursor.foreground': this.props.theme === 'sketch' ? darkBlue : white,
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

      const decorations = highlights.map(highlight => {
        const loc = highlight.highlight;
        const type = highlight.type;
        return {
          range: new this.state.monaco.Range(loc[0], loc[1], loc[2], loc[3] + 1),
          options: {
            inlineClassName: type === 'node' ? `${this.props.theme}-node-highlight` : `${this.props.theme}-scope-highlight`
          }
        }
      });

      const newDecorations = editor.deltaDecorations(clearedDecorations, decorations);
      this.setState({ currentDecorations: newDecorations });
    }
  }

  render() {
    const code = this.state.code;
    const options = {
      selectOnLineNumbers: true,
      tabSize: 2,
      wordWrap: 'on',
      wrappingIndent: 'indent',
      fontSize: 15,
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

function CodeInput({ code, setCode, nodeHighlight, scopeHighlight, theme, width }) {
  const codeEditorRef = React.useRef(null);

  useEffect(() => {
    if (codeEditorRef.current) {
      codeEditorRef.current.setState({ code }); // update the code in the editor
    }
  }, [code]);

  useEffect(() => {
    if (codeEditorRef.current) {
      const toHighlight = [];
      if (nodeHighlight !== null) toHighlight.push({ highlight: nodeHighlight, type: 'node' });
      if (scopeHighlight !== null) toHighlight.push({ highlight: scopeHighlight, type: 'scope' });

      codeEditorRef.current.setState({ theme });
      codeEditorRef.current.setHighlights(toHighlight);
    }
  }, [theme, nodeHighlight, scopeHighlight]);

  useEffect(() => {
    if (codeEditorRef.current) {
      codeEditorRef.current.handleResize();
    }
  }, [width]);

  return (
    <div style={{ float: 'right', width: '100%', height: '100%', overflow: 'hidden' }}>
      <CodeEditor code={code} setCode={setCode} ref={codeEditorRef} theme={theme} />
    </div>
  );
}

export default CodeInput;
