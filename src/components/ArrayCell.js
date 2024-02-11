import React from 'react';

function ArrayCell({ value, theme, changed, accessed }) {
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
        backgroundColor: changed ? '#0099ff' : accessed ? '#e6b400' : 'transparent'
      }}
    >
      <div style={{ margin: '5px' }}>
        {
          value === undefined ? "undefined" :
          value === '' ? '""' :
          value === true ? 'true' :
          value === false ? 'false' :
          value.length === 0 ? "[]" :
          value
        }
      </div>
    </div>
  )
}

export default ArrayCell;