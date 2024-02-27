import React from 'react';

import '../../styles/Arrow.css';

const Arrow = ({ scopeBounds, parentBounds, theme }) => {
  const bottomX = parentBounds.x + 50;
  const bottomY = scopeBounds.y + 20;
  const topX = parentBounds.x + 50;
  const topY = parentBounds.y + parentBounds.height;

  return (
    <div style={{ display: 'flex' }}>
      { /* Bottom line */}
      <div
        className={`${theme}-bottom-line`}
        style={{
          left: `${bottomX}px`,
          top: `${bottomY}px`,
          width: `${scopeBounds.x - bottomX}px`
        }}
      ></div>

      { /* Top line */}
      <div
        className={`${theme}-top-line`}
        style={{
          left: `${topX}px`,
          top: `${topY}px`,
          height: `${bottomY - topY}px`
        }}
      ></div>

      { /* Arrow head */}
      <div
        className={`${theme}-arrow-head`}
        style={{
          left: `${topX - 5.5}px`,
          top: `${topY}px`
        }}
      ></div>
    </div>
  );
}

export default Arrow;
