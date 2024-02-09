import React, { useState } from 'react';
import ArrayCell from './ArrayCell';

const ArrayTree = ({ values, theme }) => {

  const renderRow = (arr, depth) => {
    return (
      <div style={{ position: 'absolute', left: '100px', top: '0px' }}>
        {
          arr.map((value, index) => {
            return (
              <div key={`row-${index}`}>
                {
                  Array.isArray(value) ? 
                  <div>
                    <ArrayCell value={''} theme={theme} />
                    { renderRow(value, depth + 1) }
                  </div> : 
                  <ArrayCell value={value} theme={theme} />
                }
              </div>
            )
          })
        }
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', border: '1px solid red' }}>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {
          renderRow(values, 0)
        }
      </div>
    </div>
  );
};

export default ArrayTree;
