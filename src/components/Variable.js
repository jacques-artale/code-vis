import React from 'react';

function Variable({ name, value }) {
  return (
    <div>
      <p>{name} = {JSON.stringify(value)}</p>
    </div>
  );
}

export default Variable;