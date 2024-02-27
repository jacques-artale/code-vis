import React from 'react';

import '../../styles/Variable.css';

import ToolTip from './ToolTip';

function getVariableHighlight(varCreate, varUpdate, varAccess) {
  if (varCreate !== null) return 'primitive-variable-created';
  if (varUpdate !== null) return 'primitive-variable-updated';
  if (varAccess !== null) return 'primitive-variable-accessed';
  return '';
}

const Variable = ({ name, value, varChange, varCreate, varUpdate, varAccess }) => {

  const [viewTooltip, setViewTooltip] = React.useState(false);

  const highlightProperty = () => {
    let jsonStr = JSON.stringify(value, null, 2);
    if (varChange === null) {
      return jsonStr;
    }

    let path = varChange.properties;
    let current = value;
    for (let i = 0; i < path.length; i++) {
      if (current === undefined) {
        break;
      }
      current = current[path[i]];
    }

    const highlightedValue = `<span style="background-color: #0099ff;">${JSON.stringify(current)}</span>`;
    // TODO: This only highlights the first instance of the value and not the actual property
    const highlightedString = jsonStr.replace(JSON.stringify(current), highlightedValue);
    return highlightedString;
  }

  function renderObject() {
    const highlightedObject = highlightProperty();
    return (
      <pre style={{ margin: '0px' }} dangerouslySetInnerHTML={{ __html: `${name} = ${value === undefined ? "undefined" : highlightedObject}` }}>
      </pre>
    );
  }

  function createToolTip() {
    if (varCreate !== null) return <ToolTip message={varCreate.message} show={viewTooltip} />;
    if (varUpdate !== null) return <ToolTip message={varUpdate.message} show={viewTooltip} />;
    if (varAccess !== null) return <ToolTip message={varAccess.message} show={viewTooltip} />;
    return null;
  }

  function renderPrimitive() {
    let varValue = value;
    if (varValue === undefined) varValue = "undefined";
    else if (varValue === '') varValue = '""';
    else if (varValue === true) varValue = 'true';
    else if (varValue === false) varValue = 'false';

    const highlightVariable = getVariableHighlight(varCreate, varUpdate, varAccess);

    return (
      <div
        className={highlightVariable}
        style={{
          position: 'relative',
          backgroundColor: highlightVariable,
        }}
      >
        {
          createToolTip()
        }
        <p
          style={{ margin: '0px' }}
          onMouseEnter={() => setViewTooltip(true)}
          onMouseLeave={() => setViewTooltip(false)}
        >
          {name}: {varValue}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex' }}>
      {typeof value === 'object' ? renderObject() : renderPrimitive()}
    </div>
  );
}

export default Variable;