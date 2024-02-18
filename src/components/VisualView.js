import React, { useState, useEffect, useRef } from 'react';
import './../../styles/VisualView.css';

import Scope from './Scope';
import Arrow from './Arrow';

const VisualView = ({ scopes, theme, varChange, varCreate, varAccess }) => {

  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  const [bounds, setBounds] = useState([]); // [{ x: Number, y: Number, width: Number, height: Number }, ...]
  const scopeRefs = useRef({});

  useEffect(() => {
    const newBounds = calculateBounds(scopes, scopeRefs);
    setBounds(newBounds);
  }, [scopes, scale]);

  
  function calculateBounds(scopes, scopeRefs) {
    const globalScope = scopes.find(scope => scope.parentId === null);
    if (!globalScope) return [];
    
    const scopeDistances = findDistancesBFS(globalScope.id, scopes); // distances[scopeId] = distance to global    
    
    const bounds = [];
    let currentTreeHeight = 0;

    for (const scope of scopes) {
      if (scopeRefs.current[scope.id].current) {
        const rect = scopeRefs.current[scope.id].current.getBoundingClientRect();
        const x = scopeDistances[scope.id] * 100;
        const y = currentTreeHeight;

        bounds[scope.id] = { id: scope.id, x: x, y: y, width: rect.width, height: rect.height / scale};
        
        currentTreeHeight += (rect.height / scale) + 40;
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

  function createScopeComponent(scope, index) {
    scopeRefs.current[scope.id] = React.createRef();
    const bound = bounds[scope.id] || { x: 0, y: 0 };
    return (
      <div
      ref={scopeRefs.current[scope.id]}
      key={`scope-${scope.id}-${index}`}
      id={scope.id}
      style={{
        position: 'absolute',
        transform: `scale(${scale}) translate(${bound.x + translateX}px, ${bound.y + translateY}px)`,
        transformOrigin: 'top left',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
      >
        <Scope scope={scope} theme={theme} varChange={varChange} varCreate={varCreate} varAccess={varAccess} />
      </div>
    );
  }
  
  function createArrowComponent(scope, scopeBounds, parentBounds, index) {
    return (
      <div
        key={`arrow-${scope.id}-${index}`}
        style={{
          position: 'absolute',
          transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
          transformOrigin: 'top left'
        }}
      >
        <Arrow scopeBounds={scopeBounds} parentBounds={parentBounds} theme={theme}/>
      </div>
    )
  }
  
  function handleZoom(zoomIn) {
    if (zoomIn && scale >= 2) return;
    if (!zoomIn && scale <= 0.2) return;
    setScale(scale + (zoomIn ? 0.1 : -0.1));
  }
  
  function handleWheel(e) {
    if (e.deltaY < 0) handleZoom(true);
    else handleZoom(false);
  }

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.clientX / scale - translateX);
    setStartY(e.clientY / scale - translateY);
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setTranslateX(e.clientX / scale - startX);
    setTranslateY(e.clientY / scale - startY);
  }

  const handleMouseUp = () => {
    setIsDragging(false);
  }

  const handleBackToCenter = () => {
    setTranslateX(0);
    setTranslateY(0);
  }
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div className='visual-control-buttons-container'>
        <button type="button" className={`${theme}-visual-control-button`} onClick={() => handleZoom(true)}>+</button>
        <button type="button" className={`${theme}-visual-control-button`} onClick={() => handleZoom(false)}>-</button>
        <button type="button" className={`${theme}-visual-reset-button`} onClick={() => handleBackToCenter()}></button>
      </div>
      <div
        style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {
          scopes.map((scope, index) => {
            return createScopeComponent(scope, index);
          })
        }
        {
          scopes.map((scope, index) => {
            if (scope.parentId !== null && bounds[scope.id] && bounds[scope.parentId]) {
              return createArrowComponent(scope, bounds[scope.id], bounds[scope.parentId], index);
            }
            return null;
          })
        }
      </div>
    </div>
  );
}

export default VisualView;
