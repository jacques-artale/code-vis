import React, { useState } from 'react';

import ToolTip from './ToolTip';

const ArrayCell = ({ value, theme, varUpdate, varAccess }) => {

  const [viewTooltip, setViewTooltip] = useState(false);

  function createToolTip() {
    if (varUpdate !== null) return <ToolTip message={varUpdate.message} show={viewTooltip} />;
    if (varAccess !== null) return <ToolTip message={varAccess.message} show={viewTooltip} />;
    return null;
  }

  let cellValue = value;
  if (cellValue === undefined) cellValue = "undefined";
  else if (cellValue === '') cellValue = '""';
  else if (cellValue === true) cellValue = 'true';
  else if (cellValue === false) cellValue = 'false';
  else if (cellValue.length === 0) cellValue = "[]";

  return (
    <div style={{ position: 'relative' }}>
      {
        createToolTip()
      }
      <div
        style={{
          boxSizing: 'border-box',
          minWidth: '25px',
          height: '25px',
          border: `1px solid ${theme === 'sketch' ? '#062746' : '#f5e8df'}`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: varUpdate !== null ? '#0099ff' : varAccess !== null ? '#e6b400' : 'transparent'
        }}
        onMouseEnter={() => setViewTooltip(true)}
        onMouseLeave={() => setViewTooltip(false)}
      >
        <div style={{ margin: '5px' }}>
          {cellValue}
        </div>
      </div>
    </div>
  )
}

export default ArrayCell;