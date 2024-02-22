import React from 'react';
import './../../styles/ToolTip.css';

const ToolTip = ({ message, show }) => {
  return (
    <div
      className="tooltip"
      style={{
        opacity: show ? 1 : 0,
        transition: 'opacity 0.1s ease-in-out',
        zIndex: 2
      }}
    >
      <p>{message}</p>
    </div>
  );
}

export default ToolTip;
