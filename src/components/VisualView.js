import React from 'react';
import Xarrow from "react-xarrows";

import Scope from './Scope';

const VisualView = ({ scopes }) => {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', alignContent: 'flex-start' }}>
      {
        /* Scopes */
        scopes.map((scope) => (
            <div id={scope.id} key={scope.id} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', margin: '2%' }}>
              <Scope scope={scope} />
            </div>
          )
        )
      }
      {
        /* Connecting arrows */
        scopes.map((scope) => {
          if (scope.parentId !== null) {
            return (
              <Xarrow
                key={`arrow-${scope.id}`}
                start={scope.id.toString()}
                end={scope.parentId.toString()}
                startAnchor={'top'}
                endAnchor={'bottom'}
                color={'black'}
                strokeWidth={2}
              />
            );
          }
          return null;
        })
      }
    </div>
  );
}

export default VisualView;
