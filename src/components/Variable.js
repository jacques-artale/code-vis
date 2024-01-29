import React from 'react';

function Variable({ name, value }) {
  return (
    <div style={{ display: 'flex' }}>
      <p style={{ margin: '0px' }}>
        {name} = {value === undefined ? "undefined" : JSON.stringify(value)}
      </p>
    </div>
  );
}

export default Variable;