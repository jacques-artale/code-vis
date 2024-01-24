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
    const newPositions = calculatePositions(scopes, scopeRefs);
    setPositions(newPositions);
  }, [scopeComponents, scopes]);

  
  function calculatePositions(scopes, scopeRefs) {
    // count number of children with same distance to global (center)
    const scopeDistances = findDistancesBFS(0, scopes); // distances[scopeId] = distance to global

    // this will be the number of children in the same ring (placed with same distance to global in a circle)
    const scopeDistancesCount = scopeDistances.reduce((acc, curr) => {
      if (curr in acc) {
        acc[curr]++;
      } else {
        acc[curr] = 1;
      }
      return acc;
    }, {});
    
    
    const positions = [];
    
    for (const scope of scopes) {
      if (scopeRefs.current[scope.id].current) {
        const rect = scopeRefs.current[scope.id].current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        
        // the middle of each scope is the x,y position so we need to take into account the width and height

        // calculate the angle of the scope
        const childIndex = 0;
        const radius = 400 * scopeDistances[scope.id];
        const angle = 2 * Math.PI * childIndex / scopeDistancesCount[scopeDistances[scope.id]];

        // calculate the x,y position of the scope
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        positions[scope.id] = { x: x, y: y };
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
    <div style={{ position: 'relative', width: '100%', height: '100%', border: '1px solid black', overflow: 'scroll' }}>
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
