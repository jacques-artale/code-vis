import React from 'react';

const Arrow = ({ position, parentPosition, parentHeight }) => {
  const bottomX = parentPosition.x + 50;
  const bottomY = position.y + 20;
  const topX = parentPosition.x + 50;
  const topY = parentPosition.y + parentHeight;

  return (
    <div>
      { /* Bottom line */ }
      <div
        style={{
          position: 'absolute',
          left: `${bottomX}px`,
          top: `${bottomY}px`,
          width: `${position.x - bottomX}px`,
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
