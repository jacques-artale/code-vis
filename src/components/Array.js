import React from 'react';
import ArrayCell from './ArrayCell';
import ArrayTree from './ArrayTree';

const ArrayGrid = ({ name, values, varChange, varAccess, theme }) => {

  function getArrayDepth(arr) {
    return Array.isArray(arr) ? 1 + Math.max(...arr.map(getArrayDepth)) : 0;
  }

  // Check the depth of the array
  const valuesDepth = values !== undefined ? getArrayDepth(values) : 0;
  const isOneDimensional = valuesDepth === 1;
  const isTwoDimensional = valuesDepth === 2;

  // Function to render a single cell
  const renderCell = ({value, index, row}) => {
    const color = theme === 'sketch' ? '#062746' : '#f5e8df';
    const changed = varChange !== null && (
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
        <ArrayCell value={value} theme={theme} changed={changed} accessed={accessed}/>
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
          !isOneDimensional &&
          <div style={{width: '25px', display: 'flex', alignItems: 'end', justifyContent: 'center' }}>
            <p style={{ margin: 0, color: color }}>{rowIndex}</p>
          </div>
        }
        <div style={{ display: 'flex', flexDirection: 'row', backgroundColor: highlightColor }}>
          {cells.map((cell, index) => renderCell({ value: cell, index, row: rowIndex }))}
        </div>
      </div>
    );
  };

  const renderArrayTree = (arr) => {
    return (
      <div>
        <ArrayTree values={arr} varChange={varChange} varAccess={varAccess} theme={theme}/>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {name} = {
        values === undefined ? "undefined" :
        values.length === 0 ? "[]" :
        isOneDimensional ? renderRow(values, 0) :
        isTwoDimensional ? values.map(renderRow) :
        renderArrayTree(values)
      }
    </div>
  );
};

export default ArrayGrid;
