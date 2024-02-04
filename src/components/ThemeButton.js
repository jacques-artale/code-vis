import React from 'react';
import './../../styles/ThemeButton.css';

const ThemeButton = ({ theme, setTheme }) => {

  const handleThemeChange = () => {
    setTheme(theme === 'dark' ? 'sketch' : 'dark');
  }

  return (
    <div className={`theme-button ${theme}`} onClick={handleThemeChange}>
      <div className={`${theme}-sun`}></div>
      <div className={`${theme}-moon`}></div>
      <div className={`${theme}-ground`}></div>
    </div>
  );
};

export default ThemeButton;
