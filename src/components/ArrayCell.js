import React from 'react';

function ArrayCell({ value, theme, highlight }) {
  return (
    <div
      style={{
        width: '25px',
        height: '25px',
        border: `1px solid ${theme === 'sketch' ? '#062746' : '#f5e8df'}`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: highlight ? '#0099ff' : 'transparent'
      }}
    >
      {value}
    </div>
  )
}

export default ArrayCell;