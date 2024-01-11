import React from 'react';

function Console({ log }) {
  return (
    <div style={
      {
        border: "1px solid black",
        display: "flex",
        flexDirection: "column",
        marginTop: "auto",
        height: "25%",
        overflow: "scroll",
        padding: "1%"
      }
    }>
      {
        log.map((line, index) => {
          return (
            <p key={index} style={{margin: "0px"}}>: {line}</p>
          );
        })
      }
    </div>
  );
}

export default Console;