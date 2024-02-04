import React from 'react';

const Arrow = ({ scopeBounds, parentBounds, theme }) => {
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
          backgroundColor: theme === 'sketch' ? '#062746' : '#f5e8df'
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
          backgroundColor: theme === 'sketch' ? '#062746' : '#f5e8df'
        }}
      ></div>

      { /* Arrow head */ }
      <div
        style={{
          position: 'absolute',
          left: `${topX - 5.5}px`,
          top: `${topY}px`,
          borderLeft: '7px solid transparent',
          borderRight: '7px solid transparent',
          borderBottom: `14px solid ${theme === 'sketch' ? '#062746' : '#f5e8df'}`
        }}
      ></div>
    </div>
  );
}

export default Arrow;
