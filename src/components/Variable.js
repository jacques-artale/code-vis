import React from 'react';

function Variable({ name, value }) {
  return (
    <div style={{ display: 'flex' }}>
      <p style={{ margin: '0px' }}>
        {name} = {JSON.stringify(value)}
      </p>
    </div>
  );
}

export default Variable;