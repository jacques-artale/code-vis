import React from 'react';

function Console({ log }) {
  return (
    <div className='sketch-console-container'>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", overflow: "scroll" }}>
        {/* Console header */}
        <div className='sketch-console-header'>
          <p style={{ margin: "0px", paddingLeft: '5px', paddingRight: '5px' }}>CONSOLE</p>
        </div>
        {/* Console content */}
        <div style={{ marginTop: '25px' }}>
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