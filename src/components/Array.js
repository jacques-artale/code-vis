
function Array({ name, values }) {
  return (
    <div>
      <h1>
        {name} = [
          {
            values.map((value, index) => {
              return (
                <span>
                  {value}
                  {
                    index < values.length - 1 ? ', ' : ''
                  }
                </span>
              );
            })
          }
        ]
      </h1>
    </div>
  );
}

export default Array;