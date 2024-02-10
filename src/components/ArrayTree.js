import React, { useState, useEffect } from 'react';
import ArrayCell from './ArrayCell';
import Xarrow from 'react-xarrows';

const ArrayTree = ({ values, varChange, theme }) => {

  const [highlight, setHighlight] = useState(null);

  const valuesWithIds = assignCellId(values);

  useEffect(() => {
    if (varChange !== null && values !== null) {
      let currentCell = { value: valuesWithIds };
      for (let i = 0; i < varChange.properties.length; i++) {
        currentCell = currentCell.value[varChange.properties[i]];
      }
      setHighlight(currentCell.id);
    }
  }, [varChange, values]);

  function assignCellId(arr) {
    let cellId = 0;
  
    function assign(arr) {
      return arr.map((cell) => {
        if (Array.isArray(cell)) {
          return { value: assign(cell), id: cellId++ };
        } else {
          return { value: cell, id: cellId++ };
        }
      });
    }
  
    return assign(arr);
  }

  const renderTree = () => {
    // Traverse the array and build the tree
    let clusterId = 0;
    let arrows = []; // [[starClusterId, endClusterId], ...]
    let rows = []; // [row, row, ...] where row = [cluster, cluster, ...] where cluster = [cell, cell, ...]
    let queue = [{ value: valuesWithIds, id: clusterId++ }]; // [cluster, cluster, ...]

    while (queue.length > 0) {
      let clusters = [];
      let clustersCount = queue.length;
      // iterate through the current row
      for (let i = 0; i < clustersCount; i++) {
        let currentCluster = queue.shift();
        // iterate through the current array of cells in the row
        let cells = [];
        for (let cell of currentCluster.value) {
          // if the cell is an array, add it to the queue to be processed in the next row and add an empty cell component to the current row
          // otherwise, add a cell component to the current row with the value
          if (Array.isArray(cell.value)) {
            clusterId++;
            queue.push({ value: cell.value, id: clusterId });
            cells.push({ ...cell, value: '[]' });
            arrows.push([cell.id, clusterId]);
          } else {
            cells.push(cell);
          }
        }
        clusters.push({ cells, id: currentCluster.id });
      }
      rows.push(clusters);
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        {
        rows.map((row, rowIndex) => {
          return (
            <div key={`row-${rowIndex}`} style={{ marginLeft: `${rowIndex !== 0 ? 50 : 0}px` }}>
            {
              row.map((cluster, clusterIndex) => {
                return (
                  <div key={`cluster-${cluster.id}`} id={`cluster-${cluster.id}`} style={{ marginTop: `${clusterIndex !== 0 ? 20 : 0}px` }}>
                    {
                    cluster.cells.map((cell) => {
                      return (
                        <div key={`cell-${cell.id}`} id={`cell-${cell.id}`}>
                          <ArrayCell value={cell.value} theme={theme} highlight={highlight === cell.id}/>
                        </div>
                      );
                    })
                    }
                  </div>
                );
              })
            }
            </div>
          );
        })
        }
        {
          arrows.map((arrow, index) => {
            return (
              <Xarrow
                key={`arrow-${index}`}
                start={`cell-${arrow[0]}`}
                end={`cluster-${arrow[1]}`}
                color={theme === 'sketch' ? '#062746' : '#f5e8df'}
                strokeWidth={1}
                startAnchor="middle"
                endAnchor="left"
                path="straight"
              />
            );
          })
        }
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {
        renderTree()
      }
    </div>
  );
};

export default ArrayTree;
