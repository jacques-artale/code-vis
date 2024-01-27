import React from 'react';

const Arrow = ({ scopeBounds, parentBounds }) => {
  const bottomX = parentBounds.x + 50;
  const bottomY = scopeBounds.y + 20;
  const topX = parentBounds.x + 50;
  const topY = parentBounds.y + parentBounds.height;

  return (
    <div>
      { /* Bottom line */ }
      <div
        style={{
          position: 'absolute',
          left: `${bottomX}px`,
          top: `${bottomY}px`,
          width: `${scopeBounds.x - bottomX}px`,
          height: '2px',
          backgroundColor: '#586f7c'
        }}
      ></div>

      { /* Top line */ }
      <div
        style={{
          position: 'absolute',
          left: `${topX}px`,
          top: `${topY}px`,
          width: '2px',
          height: `${bottomY - topY}px`,
          backgroundColor: '#586f7c'
        }}
      ></div>
    </div>
  );
}

export default Arrow;
