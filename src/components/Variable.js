import React from 'react';

function Variable({ name, value }) {
  return (
    <div>
      <h1>{name} = {JSON.stringify(value)}</h1>
    </div>
  );
}

export default Variable;