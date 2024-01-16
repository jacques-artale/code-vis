import React from 'react';

import Variable from './Variable';
import ArrayGrid from './Array';

const Scope = ({ scope }) => {
  return (
    <div style={{ display: 'flex', flex: '0 1 auto', flexDirection: 'column', border: '1px solid black' }}>
      <p>{scope.name}</p>
      <div style={{ display: 'flex', flexDirection: 'row', border: '1px solid black' }}>
        {
          scope.variables.map(([name, value], index) => {
            return (
              <div style={{ margin: '10px' }}>
                <Variable key={index} name={name} value={value} />
              </div>
            );
          })
        }
        {
          scope.arrayVariables.map(([name, arr], index) => {
            return (
              <div style={{ margin: '20px' }}>
                <ArrayGrid key={index} name={name} values={arr} />
              </div>
            );
          })
        }
      </div>
    </div>
  );
}

export default Scope;
