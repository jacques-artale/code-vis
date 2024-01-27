import React, { useState, useEffect, useRef } from 'react';

import Scope from './Scope';
import Arrow from './Arrow';

const VisualView = ({ scopes }) => {

  const [scale, setScale] = useState(1);

  const [bounds, setBounds] = useState([]); // [{ x: Number, y: Number, width: Number, height: Number }, ...]
  const scopeRefs = useRef({});

  useEffect(() => {
    const newBounds = calculateBounds(scopes, scopeRefs);
    setBounds(newBounds);
  }, [scopes]);

  
  function calculateBounds(scopes, scopeRefs) {
    const scopeDistances = findDistancesBFS(0, scopes); // distances[scopeId] = distance to global    
    
    const bounds = [];
    let currentTreeHeight = 0;

    for (const scope of scopes) {
      if (scopeRefs.current[scope.id].current) {
        const rect = scopeRefs.current[scope.id].current.getBoundingClientRect();
        const x = scopeDistances[scope.id] * 100;
        const y = currentTreeHeight;

        bounds[scope.id] = { x: x, y: y, width: rect.width, height: rect.height};
        
        currentTreeHeight += rect.height + 20;
      }
    }

    return bounds;
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
    scopeRefs.current[scope.id] = React.createRef();
    return (
      <div
        ref={scopeRefs.current[scope.id]}
        key={`scope-${scope.id}`}
        style={{
          position: 'absolute',
          left: `${bounds[scope.id] ? bounds[scope.id].x : 0}px`,
          top: `${bounds[scope.id] ? bounds[scope.id].y : 0}px`,
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

  function createArrowComponent(scope, scopeBounds, parentBounds) {
    return (
      <div key={`arrow-${scope.id}`}>
        <Arrow scopeBounds={scopeBounds} parentBounds={parentBounds}/>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }} onWheel={handleWheel}>
      <button onClick={() => handleZoom(true)}>+</button>
      <button onClick={() => handleZoom(false)}>-</button>

      <div style={{ transform: `scale(${scale})`, position: 'absolute', border: '1px solid black' }}>
        {
          scopes.map((scope) => {
            return createScopeComponent(scope);
          })
        }
        {
          scopes.map((scope) => {
            if (scope.parentId !== null && bounds[scope.id] && bounds[scope.parentId]) {
              return createArrowComponent(scope, bounds[scope.id], bounds[scope.parentId]);
            }
          })
        }
      </div>
    </div>
  );
}

export default VisualView;
