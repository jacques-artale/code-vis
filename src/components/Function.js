import React from 'react';

import './../../styles/Function.css';

const Function = ({ name, theme }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <p className={`${theme}-function-declaration`}>
        <i className={`${theme}-function`}>function:</i> {name}()
      </p>
    </div>
  );
};

export default Function;
