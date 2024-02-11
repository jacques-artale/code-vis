import React from 'react';

function ArrayCell({ value, theme, highlight }) {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        minWidth: '25px',
        height: '25px',
        border: `1px solid ${theme === 'sketch' ? '#062746' : '#f5e8df'}`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: highlight ? '#0099ff' : 'transparent'
      }}
    >
      <div style={{ margin: '5px' }}>
        {
          value === undefined ? "undefined" :
          value === '' ? '""' :
          value === true ? 'true' :
          value === false ? 'false' :
          value
        }
      </div>
    </div>
  )
}

export default ArrayCell;