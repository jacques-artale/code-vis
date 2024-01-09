import React from 'react';

import Variable from './Variable';
import ArrayGrid from './Array';

const VisualView = ({ variables, arrayVariables }) => {
  return (
    <div>
      {
        variables.map(([name, value]) => {
          return (
            <Variable key={name} name={name} value={value} />
          );
        })
      }
      {
        arrayVariables.map(([name, values]) => {
          return (
            <ArrayGrid key={name} name={name} values={values} />
          );
        })
      }
    </div>
  );
}

export default VisualView;
