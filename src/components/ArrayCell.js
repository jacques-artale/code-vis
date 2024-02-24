import React, { useState } from 'react';

import ToolTip from './ToolTip';

const ArrayCell = ({ value, theme, updated, accessed }) => {

  const [viewTooltip, setViewTooltip] = useState(false);

  function createToolTip() {
    if (updated) return <ToolTip message="Variable updated" show={viewTooltip} />;
    if (accessed) return <ToolTip message="Variable accessed" show={viewTooltip} />;
    return null;
  }

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
          backgroundColor: updated ? '#0099ff' : accessed ? '#e6b400' : 'transparent'
        }}
        onMouseEnter={() => setViewTooltip(true)}
        onMouseLeave={() => setViewTooltip(false)}
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
    </div>
  )
}

export default ArrayCell;