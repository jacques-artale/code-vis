import React from 'react';

function Variable({ name, value, varChange }) {

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
  
  function renderPrimitive() {
    return (
      <p style={{ margin: '0px' }}>
        {name} = {value === undefined ? "undefined" : value}
      </p>
    );
  }
  
  return (
    <div style={{ display: 'flex' }}>
      {typeof value === 'object' ? renderObject() : renderPrimitive()}
    </div>
  );
}

export default Variable;