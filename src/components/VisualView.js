import React, { useState, useEffect, useRef } from 'react';
import Xarrow from "react-xarrows";

import Scope from './Scope';

const VisualView = ({ scopes }) => {

  const [scopeComponents, setScopeComponents] = useState([]); // [scopeComponent, ...]
  const [positions, setPositions] = useState([]); // [{ x: 0, y: 0 }, ...]
  const scopeRefs = useRef({});

  useEffect(() => {
    const newScopeComponents = [];
    const newPositions = [];

    for (const scope of scopes) {
      scopeRefs.current[scope.id] = React.createRef();
      newScopeComponents[scope.id] = createScopeComponent(scope);
      newPositions[scope.id] = { x: 0, y: 0 };
    }

    setScopeComponents(newScopeComponents);
    setPositions(newPositions);
  }, [scopes]);

  useEffect(() => {
    const newPositions = [];
    for (const scope of scopes) {
      if (scopeRefs.current[scope.id].current) {
        const rect = scopeRefs.current[scope.id].current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        
        // Insert amazing algorithm to calculate positions here
        newPositions[scope.id] = { x: width, y: height };
      }
    }
    setPositions(newPositions);
  }, [scopeComponents]);

  function createScopeComponent(scope) {
    return (
      <div
        ref={scopeRefs.current[scope.id]}
        id={scope.id}
        key={scope.id}
        style={{
          position: 'absolute',
          left: `${positions[scope.id] ? positions[scope.id].x : 0}px`,
          top: `${positions[scope.id] ? positions[scope.id].y : 0}px`,
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          margin: '2%'
        }}
      >
        <Scope scope={scope} />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', border: '1px solid black' }}>
      {
        /* Scopes */
        scopeComponents.map((scopeComponent) => scopeComponent)
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
                color={'#586f7c'}
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
