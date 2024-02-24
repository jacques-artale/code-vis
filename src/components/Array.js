import React, { useState } from 'react';

import ArrayCell from './ArrayCell';
import ArrayTree from './ArrayTree';
import ToolTip from './ToolTip';

const ArrayGrid = ({ scope, name, values, varChange, varAccess, created, updated, accessed, theme }) => {

  const [viewTooltip, setViewTooltip] = useState(false);

  function getArrayDepth(arr) {
    return Array.isArray(arr) ? 1 + Math.max(...arr.map(getArrayDepth)) : 0;
  }

  // Check the depth of the array
  const valuesDepth = values !== undefined ? getArrayDepth(values) : 0;
  const isOneDimensional = valuesDepth === 1;
  const isTwoDimensional = valuesDepth === 2;

  // Function to render a single cell
  const renderCell = ({ value, index, row }) => {
    const color = theme === 'sketch' ? '#062746' : '#f5e8df';
    const updated = varChange !== null && (
      (isOneDimensional && varChange.properties[0] === index) ||
      (isTwoDimensional && varChange.properties[0] === row && varChange.properties[1] === index)
    );
    const accessed = varAccess !== null && (
      (isOneDimensional && varAccess.properties[0] === index) ||
      (isTwoDimensional && varAccess.properties[0] === row && varAccess.properties[1] === index)
    );

    return (
      <div key={`cell-${row}-${index}`}>
        {
          row === 0 && <p style={{ color: color, margin: 0, textAlign: 'center' }}>{index}</p>
        }
        <ArrayCell value={value} theme={theme} updated={updated} accessed={accessed} />
      </div>
    );
  };

  // Function to render a single row
  const renderRow = (row, rowIndex) => {
    const changed = varChange !== null && varChange.properties.length === 1 && varChange.properties[0] === rowIndex;
    const accessed = varAccess !== null && varAccess.properties.length === 1 && varAccess.properties[0] === rowIndex;
    const highlightColor = changed ? '#0099ff' : accessed ? '#e6b400' : 'transparent';

    // If the array is one-dimensional, treat each item as a cell in a single row
    // Otherwise, treat each item as a row
    const cells = isOneDimensional ? values : (Array.isArray(row) ? row : [row]);
    const color = theme === 'sketch' ? '#062746' : '#f5e8df';

    return (
      <div key={`row-${rowIndex}`} style={{ display: 'flex' }}>
        {
          // Show the row index
          !isOneDimensional &&
          <div style={{ width: '25px', display: 'flex', alignItems: 'end', justifyContent: 'center' }}>
            <p style={{ margin: 0, color: color }}>{rowIndex}</p>
          </div>
        }
        <div style={{ position: 'relative' }}>
          {
            createToolTip(false, changed, accessed)
          }
          <div
            style={{ display: 'flex', flexDirection: 'row', backgroundColor: highlightColor }}
            onMouseEnter={() => setViewTooltip(true)}
            onMouseLeave={() => setViewTooltip(false)}
          >
            {
              cells.map((cell, index) => renderCell({ value: cell, index, row: rowIndex }))
            }
          </div>
        </div>
      </div>
    );
  };

  const renderArrayTree = (arr) => {
    return (
      <div>
        <ArrayTree scope={scope} values={arr} varChange={varChange} varAccess={varAccess} theme={theme} />
      </div>
    )
  }

  function createToolTip(created, updated, accessed) {
    if (created) return <ToolTip message="Variable created" show={viewTooltip} />;
    if (updated) return <ToolTip message="Variable updated" show={viewTooltip} />;
    if (accessed) return <ToolTip message="Variable accessed" show={viewTooltip} />;
    return null;
  }

  return (
    <div style={{ position: 'relative' }}>
      {
        createToolTip(created, updated, accessed)
      }
      <div
        style={{ display: 'flex', flexDirection: 'column' }}
        onMouseEnter={() => setViewTooltip(true)}
        onMouseLeave={() => setViewTooltip(false)}
      >
        {name} = {
          values === undefined ? "undefined" :
            values.length === 0 ? "[]" :
              isOneDimensional ? renderRow(values, 0) :
                isTwoDimensional ? values.map(renderRow) :
                  renderArrayTree(values)
        }
      </div>
    </div>
  );
};

export default ArrayGrid;
