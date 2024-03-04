import React, { useState } from 'react';

import '../../styles/Array.css';

import ArrayCell from './ArrayCell';
import ArrayTree from './ArrayTree';
import ToolTip from './ToolTip';

const ArrayGrid = ({ scope, values, varCreate, varUpdate, varAccess, theme }) => {

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
    const updated = varUpdate !== null && varUpdate.properties !== null && (
      (isOneDimensional && varUpdate.properties[0] === index) ||
      (isTwoDimensional && varUpdate.properties[0] === row && varUpdate.properties[1] === index)
    );
    const accessed = varAccess !== null && varAccess.properties !== null && (
      (isOneDimensional && varAccess.properties[0] === index) ||
      (isTwoDimensional && varAccess.properties[0] === row && varAccess.properties[1] === index)
    );

    return (
      <div key={`cell-${row}-${index}`}>
        {
          row === 0 && <p className={`${theme}-array-column-index`}>{index}</p>
        }
        <ArrayCell value={value} theme={theme} varUpdate={updated ? varUpdate : null} varAccess={accessed ? varAccess : null} />
      </div>
    );
  };

  // Function to render a single row
  const renderRow = (row, rowIndex) => {
    // Only highlight entire rows if the array is two-dimensional
    const rowUpdated = isTwoDimensional && varUpdate !== null && varUpdate.properties !== null && varUpdate.properties.length === 1 && varUpdate.properties[0] === rowIndex;
    const rowAccessed = isTwoDimensional && varAccess !== null && varAccess.properties !== null && varAccess.properties.length === 1 && varAccess.properties[0] === rowIndex;
    let highlightRow = 'array-row';
    if (rowUpdated) highlightRow = 'array-row-updated';
    else if (rowAccessed) highlightRow = 'array-row-accessed';

    // If the array is one-dimensional, treat each item as a cell in a single row
    // Otherwise, treat each item as a row
    const cells = isOneDimensional ? values : (Array.isArray(row) ? row : [row]);

    return (
      <div key={`row-${rowIndex}`} style={{ display: 'flex' }}>
        {
          // Show the row index
          !isOneDimensional &&
          <div style={{ width: '25px', display: 'flex', alignItems: 'end', justifyContent: 'center' }}>
            <p className={`${theme}-array-row-index`}>{rowIndex}</p>
          </div>
        }
        <div style={{ position: 'relative' }}>
          {
            createToolTip(null, rowUpdated ? varUpdate : null, rowAccessed ? varAccess : null)
          }
          <div
            className={highlightRow}
            onMouseEnter={() => setViewTooltip(true)}
            onMouseLeave={() => setViewTooltip(false)}
          >
            {
              cells.map((cell, index) => renderCell({ value: cell, index: index, row: rowIndex }))
            }
          </div>
        </div>
      </div>
    );
  };

  const renderArrayTree = (arr) => {
    return (
      <div>
        <ArrayTree scope={scope} values={arr} varUpdate={varUpdate} varAccess={varAccess} theme={theme} />
      </div>
    )
  }

  function createToolTip(varCreate, varUpdate, varAccess) {
    if (varCreate !== null) return <ToolTip message={varCreate.message} show={viewTooltip} />;
    if (varUpdate !== null) return <ToolTip message={varUpdate.message} show={viewTooltip} />;
    if (varAccess !== null) return <ToolTip message={varAccess.message} show={viewTooltip} />;
    return null;
  }

  const updatedEntireArray = varUpdate !== null && varUpdate.properties === null;
  const createdEntireArray = varCreate !== null;
  const accessedEntireArray = varAccess !== null && varAccess.properties === null;

  let highlightArray = 'array-grid';
  if (updatedEntireArray) highlightArray = 'array-grid-updated';
  else if (createdEntireArray) highlightArray = 'array-grid-created';
  else if (accessedEntireArray) highlightArray = 'array-grid-accessed';

  let arrValues;
  if (values === undefined) arrValues = "undefined";
  else if (values.length === 0) arrValues = "[]";
  else if (isOneDimensional) arrValues = renderRow(values, 0);
  else if (isTwoDimensional) arrValues = values.map(renderRow);
  else arrValues = renderArrayTree(values);

  return (
    <div className={highlightArray}>
      {
        createToolTip(createdEntireArray ? varCreate : null, updatedEntireArray ? varUpdate : null, accessedEntireArray ? varAccess : null)
      }
      <div
        style={{ display: 'flex', flexDirection: 'column' }}
        onMouseEnter={() => setViewTooltip(true)}
        onMouseLeave={() => setViewTooltip(false)}
      >
        {arrValues}
      </div>
    </div>
  );
};

export default ArrayGrid;
