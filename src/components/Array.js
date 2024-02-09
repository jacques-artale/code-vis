import React from 'react';
import ArrayCell from './ArrayCell';
import ArrayTree from './ArrayTree';

const ArrayGrid = ({ name, values, varChange, theme }) => {

  function getArrayDepth(arr) {
    return Array.isArray(arr) ? 1 + Math.max(...arr.map(getArrayDepth)) : 0;
  }

  // Check the depth of the array
  const isOneDimensional = values !== undefined ? getArrayDepth(values) === 1 : false;
  const isTwoDimensional = values !== undefined ? getArrayDepth(values) === 2 : false;

  // Function to render a single cell
  const renderCell = ({value, index, row}) => {
    const color = theme === 'sketch' ? '#062746' : '#f5e8df';
    const highlight = varChange !== null && (
      (isOneDimensional && varChange.properties[0] === index) ||
      (!isOneDimensional && varChange.properties[0] === row && varChange.properties[1] === index)
    );
    return (
      <div key={`cell-${row}-${index}`}>
        {
          row === 0 && <p style={{ color: color, margin: 0, textAlign: 'center' }}>{index}</p>
        }
        <ArrayCell value={value} theme={theme} highlight={highlight}/>
      </div>
    );
  };

  // Function to render a single row
  const renderRow = (row, rowIndex) => {
    // If the array is one-dimensional, treat each item as a cell in a single row
    // Otherwise, treat each item as a row
    const cells = isOneDimensional ? values : (Array.isArray(row) ? row : [row]);
    const color = theme === 'sketch' ? '#062746' : '#f5e8df';

    return (
      <div key={`row-${rowIndex}`} style={{ display: 'flex' }}>
        {
          !isOneDimensional &&
          <div style={{width: '25px', display: 'flex', alignItems: 'end', justifyContent: 'center' }}>
            <p style={{ margin: 0, color: color }}>{rowIndex}</p>
          </div>
        }
        {cells.map((cell, index) => renderCell({ value: cell, index, row: rowIndex }))}
      </div>
    );
  };

  const renderArrayTree = (arr) => {
    return (
      <div>
        <ArrayTree values={arr} theme={theme}/>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {name} = {
        values === undefined ? "undefined" :
        isOneDimensional ? renderRow(values, 0) :
        isTwoDimensional ? values.map(renderRow) :
        renderArrayTree(values)
      }
    </div>
  );
};

export default ArrayGrid;
