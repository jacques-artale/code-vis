
function Console({ log }) {
  return (
    <div style={
      {
        border: "1px solid black",
        display: "flex",
        flexDirection: "column",
        marginTop: "auto",
        height: "20%",
        overflow: "scroll",
        padding: "1%"
      }
    }>
      {
        log.map((line) => {
          return (
            <p style={{margin: "0px"}}>: {line}</p>
          );
        })
      }
    </div>
  );
}

export default Console;