import React from 'react';

import Variable from './Variable';
import ArrayGrid from './Array';

const VisualView = ({ variables, arrayVariables }) => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      {
        variables.map(([name, value], index) => {
          return (
            <Variable key={index} name={name} value={value} />
          );
        })
      }
      {
        arrayVariables.map(([name, values], index) => {
          return (
            <ArrayGrid key={index} name={name} values={values} />
          );
        })
      }
      {
        (variables.length === 0 && arrayVariables.length === 0) &&
        <div>
          <p>To start, 'parse' and 'run' code</p>
        </div>
      }
    </div>
  );
}

export default VisualView;
