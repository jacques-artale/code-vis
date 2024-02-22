import React from 'react';

import ToolTip from './ToolTip';

function Variable({ name, value, varChange, created, updated, accessed }) {

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
    if (created) return <ToolTip message="Variable created" show={viewTooltip} />;
    if (updated) return <ToolTip message="Variable updated" show={viewTooltip} />;
    if (accessed) return <ToolTip message="Variable accessed" show={viewTooltip} />;
    return null;
  }

  function renderPrimitive() {
    const highlightColor = updated ? '#0099ff' : created ? '#378805' : accessed ? '#e6b400' : 'transparent';

    return (
      <div
        style={{
          position: 'relative',
          backgroundColor: highlightColor,
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
          {name} = {
            value === undefined ? "undefined" :
              value === '' ? '""' :
                value === true ? 'true' :
                  value === false ? 'false' :
                    value
          }
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