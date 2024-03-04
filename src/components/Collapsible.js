import React, { useState } from 'react';

import './../../styles/Collapsible.css';

const Collapsible = ({ children, collapsedTitle, expandedTitle, initCollapse, theme }) => {

  const [collapsed, setCollapsed] = useState(initCollapse || false);

  return (
    <div className={'collapsible-container'}>
      <div
        className={'collapsible-title-container'}
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className={`${theme}-collapsible-arrow${collapsed ? '-closed' : '-open'}`}></div>
        <p className={'collapsible-title'}>
          {collapsed ? collapsedTitle : expandedTitle}
        </p>
      </div>
      <div className={`collapsible-content${collapsed ? '-collapsed' : '-expanded'}`}>
        {children}
      </div>
    </div>
  )
};

export default Collapsible;
