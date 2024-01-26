import React, { useState, useEffect, useRef } from 'react';

import Scope from './Scope';
import Arrow from './Arrow';

const VisualView = ({ scopes }) => {

  const [scale, setScale] = useState(1);

  const [scopeComponents, setScopeComponents] = useState([]); // [scopeComponent, ...]
  const [arrowComponents, setArrowComponents] = useState([]); // [arrowComponent, ...]
  const [positions, setPositions] = useState([]); // [{ x: 0, y: 0 }, ...]
  const scopeRefs = useRef({});

  useEffect(() => {
    const newScopeComponents = [];
    const newPositions = [];

    for (const scope of scopes) {
      scopeRefs.current[scope.id] = React.createRef();
      newScopeComponents[scope.id] = createScopeComponent(scope);
    }

    setScopeComponents(newScopeComponents);
    setPositions(newPositions);
  }, [scopes]);

  useEffect(() => {
    const newPositions = calculatePositions(scopes, scopeRefs);
    setPositions(newPositions);

    const newArrowComponents = [];
    for (const scope of scopes) {
      if (scope.parentId !== null && newPositions[scope.id] && newPositions[scope.parentId]) {
        newArrowComponents[scope.id] = createArrowComponent(scope, newPositions[scope.id], newPositions[scope.parentId]);
      }
    }

    setArrowComponents(newArrowComponents);
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
        key={`scope-${scope.id}`}
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

  function createArrowComponent(scope, position, parentPosition) {
    const parentHeight = scopeRefs.current[scope.parentId].current.getBoundingClientRect().height;
    return (
      <div key={`arrow-${scope.id}`}>
        <Arrow position={position} parentPosition={parentPosition} parentHeight={parentHeight}/>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }} onWheel={handleWheel}>
      <button onClick={() => handleZoom(true)}>+</button>
      <button onClick={() => handleZoom(false)}>-</button>

      <div style={{ transform: `scale(${scale})`, position: 'absolute', border: '1px solid black' }}>
        {
          scopeComponents.map((scopeComponent) => scopeComponent)
        }
        {
          arrowComponents.map((arrowComponent) => arrowComponent)
        }
      </div>
    </div>
  );
}

export default VisualView;
