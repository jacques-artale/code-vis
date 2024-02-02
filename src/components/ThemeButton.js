import React from 'react';
import './../../styles/ThemeButton.css';

const ThemeButton = ({ theme, setTheme }) => {

  const handleThemeChange = () => {
    setTheme(theme === 'dark' ? 'sketch' : 'dark');
  }

  return (
    <div className={`theme-button ${theme}`} onClick={handleThemeChange}>
      <div className='sun'></div>
      <div className='moon'></div>
      <div className='ground'></div>
    </div>
  );
};

export default ThemeButton;
