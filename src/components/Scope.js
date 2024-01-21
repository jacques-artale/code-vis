import React from 'react';

import Variable from './Variable';
import ArrayGrid from './Array';

const Scope = ({ scope }) => {
  return (
    <div
      style={{
        display: 'flex',
        flex: '0 1 auto',
        flexDirection: 'column',
        border: `${scope.active ? '2px solid #ff9900' : '2px solid #586f7c'}`,
        borderRadius: '5px'
      }}
    >
      <div style={{ display: 'flex', backgroundColor: '#586f7c', color: '#f4f4f9', borderBottom: '2px solid #586f7c' }}>
        <p>{scope.name}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        {
          scope.variables.map(([name, value], index) => {
            return (
              <div key={`var-${index}`} style={{ margin: '10px' }}>
                <Variable name={name} value={value} />
              </div>
            );
          })
        }
        {
          scope.arrayVariables.map(([name, arr], index) => {
            return (
              <div key={`array-${index}`} style={{ margin: '10px' }}>
                <ArrayGrid name={name} values={arr} />
              </div>
            );
          })
        }
      </div>
    </div>
  );
}

export default Scope;
