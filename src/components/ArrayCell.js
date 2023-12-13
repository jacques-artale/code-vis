import React from 'react';

function ArrayCell({ key, value }) {
  return (
    <div key={key} style={{width: '25px', height: '25px', border: '1px solid black', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      {value}
    </div>
  )
}

export default ArrayCell;