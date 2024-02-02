import React from 'react';
import './../../styles/Scope.css';

import Variable from './Variable';
import ArrayGrid from './Array';

const Scope = ({ scope }) => {
  return (
    <div className={`sketch-scope-container${scope.active ? '-active' : ''}`}>
      <div className='sketch-scope-header'>
        <p className='sketch-scope-name'>{scope.name}</p>
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
