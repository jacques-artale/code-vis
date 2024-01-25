import React, { useState, useEffect, useRef } from 'react';
import Xarrow from "react-xarrows";

import Scope from './Scope';

const VisualView = ({ scopes }) => {

  const [scale, setScale] = useState(1);

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
    const newPositions = calculatePositions(scopes, scopeRefs);
    setPositions(newPositions);
  }, [scopeComponents, scopes]);

  
  function calculatePositions(scopes, scopeRefs) {
    // count number of children with same distance to global (center)
    const scopeDistances = findDistancesBFS(0, scopes); // distances[scopeId] = distance to global    
    
    const positions = [];
    let currentTreeHeight = 0;

    for (const scope of scopes) {
      if (scopeRefs.current[scope.id].current) {
        const x = scopeDistances[scope.id] * 100;
        const y = currentTreeHeight;

        positions[scope.id] = { x: x, y: y };
        
        const rect = scopeRefs.current[scope.id].current.getBoundingClientRect();
        currentTreeHeight += rect.height + 20;
      }
    }

    return positions;
  }

  function findDistancesBFS(globalScopeId, scopes) {
    const distances = [];
    distances[globalScopeId] = 0;

    let queue = [globalScopeId];

    while (queue.length > 0) {
      let currentScopeId = queue.shift();

      let children = scopes.filter(scope => scope.parentId === currentScopeId);

      for (let child of children) {
        if (!(child.id in distances)) {
          distances[child.id] = distances[currentScopeId] + 1;
          queue.push(child.id);
        }
      }
    }

    return distances;
  }

  function handleZoom(zoomIn) {
    if (zoomIn && scale >= 2) return;
    if (!zoomIn && scale <= 0.5) return;

    setScale(scale + (zoomIn ? 0.1 : -0.1));
  }

  function handleWheel(e) {
    if (e.deltaY < 0) {
      handleZoom(true);
    } else {
      handleZoom(false);
    }
  }

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
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }} onWheel={handleWheel}>
      <button onClick={() => handleZoom(true)}>+</button>
      <button onClick={() => handleZoom(false)}>-</button>

      <div style={{ transform: `scale(${scale})`, position: 'absolute', border: '1px solid black' }}>
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
    </div>
  );
}

export default VisualView;
