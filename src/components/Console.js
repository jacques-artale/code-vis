import React from 'react';
import './../../styles/Console.css';

function Console({ log, theme }) {
  return (
    <div className={`${theme}-console-container`}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", overflow: "scroll" }}>
        {/* Console header */}
        <div className={`${theme}-console-header`}>
          <p style={{ margin: "0px", paddingLeft: '5px', paddingRight: '5px' }}>CONSOLE</p>
        </div>
        {/* Console content */}
        <div>
          {
            log.map((line, index) => {
              return (
                <p key={index} style={{margin: "0px", marginLeft: '10px'}}>{JSON.stringify(line)}</p>
              );
            })
          }
        </div>
      </div>
    </div>
  );
}

export default Console;