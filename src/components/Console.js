import React from 'react';

function Console({ log }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginTop: "auto", height: "30%", border: '1px solid black' }}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", overflow: "scroll" }}>
        {/* Console header */}
        <div style={{ display: 'flex', position: 'fixed', backgroundColor: '#586f7c', color: '#f4f4f9', textAlign: 'center', paddingRight: '5px', borderBottomRightRadius: '7px', border: '1px solid #586f7c' }}>
          <p style={{ margin: "0px", paddingLeft: '5px' }}>Console</p>
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