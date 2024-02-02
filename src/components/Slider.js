import React, { useEffect, useState, useRef } from 'react';

import './../../styles/Slider.css';

const Slider = ({ min, max, value, onInputChange, theme }) => {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef();

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const calculateNewValue = (event) => {
    const { left, width } = sliderRef.current.getBoundingClientRect();
    const clickPositionInPixels = event.clientX - left;
    const clickPositionAsPercentage = clickPositionInPixels / width;
    const valueRange = max - min;
    let newValue = min + (valueRange * clickPositionAsPercentage);
  
    // Ensure newValue doesn't go beyond the min and max range
    newValue = Math.round(Math.max(min, Math.min(max, newValue)));
    return newValue;
  };
  
  const handleMouseDown = (event) => {
    event.preventDefault();
    setIsDragging(true);
    if (onInputChange) {
      onInputChange(calculateNewValue(event));
    }
  }
  
  const handleMouseUp = () => {
    setIsDragging(false);
  }

  const handleClick = (event) => {
    if (onInputChange) {
      onInputChange(calculateNewValue(event));
    }
  }
  
  const handleMouseMove = (event) => {
    if (isDragging && onInputChange) {
      onInputChange(calculateNewValue(event));
    }
  }

  return (
    <div
      ref={sliderRef}
      className={'slider-container'}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
    >
      { /** Left side track */}
      <div
        className={`${theme}-slider-track-left`}
        style={{
          width: `${(value / max) * 100}%`,
        }}
      ></div>
      { /** Right side track */}
      <div
        className={`${theme}-slider-track-right`}
        style={{
          left: `${(value / max) * 100}%`,
          width: `${((max - value) / max) * 100}%`,
        }}
      ></div>
      { /** Thumb */}
      <div
        className={`${theme}-slider-thumb`}
        style={{
          left: `${(value / max) * 100}%`,
        }}
        onMouseDown={handleMouseDown}
      ></div>
    </div>
  )
}

export default Slider;
