import React from 'react';
import ArrayCell from './ArrayCell';

const ArrayGrid = ({ name, values }) => {

  if (!Array.isArray(values)) {
    return null;
  }

  // Check if the array is one-dimensional
  const isOneDimensional = values.every((item) => !Array.isArray(item));

  // Function to render a single cell
  const renderCell = ({value, index, row}) => {
    return (
      <div key={`cell-${row}-${index}`}>
        {
          row === 0 && <p style={{ color: '#003366', margin: 0, width: '25px', height: '25px', textAlign: 'center' }}>{index}</p>
        }
        <ArrayCell value={value} />
      </div>
    );
  };

  // Function to render a single row
  const renderRow = (row, rowIndex) => {
    // If the array is one-dimensional, treat each item as a cell in a single row
    // Otherwise, treat each item as a row
    const cells = isOneDimensional ? values : (Array.isArray(row) ? row : [row]);

    return (
      <div key={`row-${rowIndex}`} style={{ display: 'flex' }}>
        <div style={{width: '25px', display: 'flex', alignItems: 'end', justifyContent: 'center' }}>
          <p style={{ margin: 0, color: '#003366' }}>{rowIndex}</p>
        </div>
        {cells.map((cell, index) => renderCell({ value: cell, index, row: rowIndex }))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {name} = {values === undefined ? "undefined" : isOneDimensional ? renderRow(values, 0) : values.map(renderRow)}
    </div>
  );
};

export default ArrayGrid;
