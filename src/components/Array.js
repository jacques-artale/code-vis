import React from 'react';
import ArrayCell from './ArrayCell';

const ArrayGrid = ({ name, values }) => {

  // Check if the array is one-dimensional
  const isOneDimensional = values.every((item) => !Array.isArray(item));

  // Function to render a single cell
  const renderCell = (value, index) => {
    return <ArrayCell key={index} value={value} />;
  };

  // Function to render a single row
  const renderRow = (row, rowIndex) => {
    // If the array is one-dimensional, treat each item as a cell in a single row
    // Otherwise, treat each item as a row
    const cells = isOneDimensional ? values : (Array.isArray(row) ? row : [row]);

    return (
      <div key={rowIndex} style={{ display: 'flex' }}>
        {cells.map(renderCell)}
      </div>
    );
  };

  return (
    <div>
      {name} :
      {isOneDimensional ? renderRow(values, 0) : values.map(renderRow)}
    </div>
  );
};

export default ArrayGrid;
