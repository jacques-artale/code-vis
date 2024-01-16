import React from 'react';

import Scope from './Scope';

const VisualView = ({ scopes }) => {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
      {
        scopes.map((scope, index) => {
          return (
            <div key={index}>
              {
                scope.variables.length > 0 || scope.arrayVariables.length > 0 ?
                <Scope scope={scope} />
                : null
              }
            </div>
          );
        })
      }
    </div>
  );
}

export default VisualView;
