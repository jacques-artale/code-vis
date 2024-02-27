import React, { useState } from 'react';

import '../../styles/ArrayCell.css';

import ToolTip from './ToolTip';

const getCellHighlight = (theme, varUpdate, varAccess) => {
  if (varUpdate !== null) return `${theme}-array-cell-updated`;
  if (varAccess !== null) return `${theme}-array-cell-accessed`;
  return `${theme}-array-cell`;
};

const ArrayCell = ({ value, theme, varUpdate, varAccess }) => {

  const [viewTooltip, setViewTooltip] = useState(false);

  let cellValue = value;
  if (cellValue === undefined) cellValue = "undefined";
  else if (cellValue === '') cellValue = '""';
  else if (cellValue === true) cellValue = 'true';
  else if (cellValue === false) cellValue = 'false';
  else if (cellValue.length === 0) cellValue = "[]";

  const cellHighlight = getCellHighlight(theme, varUpdate, varAccess);

  return (
    <div style={{ position: 'relative' }}>
      {
        varUpdate && <ToolTip message={varUpdate.message} show={viewTooltip} />
      }
      {
        varAccess && <ToolTip message={varAccess.message} show={viewTooltip} />
      }
      <div
        className={cellHighlight}
        onMouseEnter={() => setViewTooltip(true)}
        onMouseLeave={() => setViewTooltip(false)}
      >
        <div style={{ margin: '5px' }}>
          {cellValue}
        </div>
      </div>
    </div>
  )
}

export default ArrayCell;