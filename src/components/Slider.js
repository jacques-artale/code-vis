import React, { useState } from 'react';

const Slider = ({ min, max, step, value, onInputChange }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseMove = (event) => {
    if (isDragging) {
      const newValue = calculateNewValue(event);
      onInputChange(newValue);
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false);
  }

  const handleMouseDown = () => {
    setIsDragging(true);
  }

  const calculateNewValue = (event) => {
    const { left, width } = event.target.getBoundingClientRect();
    const clickX = event.pageX - left;
    const newValue = (clickX / width) * (max - min) + min;
    return Math.round(newValue / step) * step;
  }

  return (
    <div className='sketch-slider-container' onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      { /** Left side track */}
      <div
        className='sketch-slider-track-left'
        style={{
          width: `${(value / max) * 100}%`,
        }}
      ></div>
      { /** Right side track */}
      <div
        className='sketch-slider-track-right'
        style={{
          left: `${(value / max) * 100}%`,
          width: `${((max - value) / max) * 100}%`,
        }}
      ></div>
      { /** Thumb */}
      <div
        className='sketch-slider-thumb'
        style={{
          left: `${(value / max) * 100}%`,
        }}
        onMouseDown={handleMouseDown}
      ></div>
    </div>
  )
}

export default Slider;
