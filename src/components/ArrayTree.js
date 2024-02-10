import React, {  } from 'react';
import ArrayCell from './ArrayCell';
import Xarrow from 'react-xarrows';

const ArrayTree = ({ values, theme }) => {

  const renderTree = () => {
    let clusterId = 0;
    let cellId = 0;

    let arrows = []; // [[starClusterId, endClusterId], ...]
    let rows = []; // [row, row, ...] where row = [cluster, cluster, ...] where cluster = [cell, cell, ...]
    let queue = [{ cluster: values, id: clusterId }]; // [cluster, cluster, ...]
    while (queue.length > 0) {
      let clusters = [];
      let clustersCount = queue.length;
      // iterate through the current row
      for (let i = 0; i < clustersCount; i++) {
        let { cluster: current, id: currentId} = queue.shift();
        // iterate through the current array of cells in the row
        let cells = [];
        for (let cell of current) {
          cellId++;
          // if the cell is an array, add it to the queue to be processed in the next row and add an empty cell component to the current row
          // otherwise, add a cell component to the current row with the value
          if (Array.isArray(cell)) {
            clusterId++;
            queue.push({ cluster: cell, id: clusterId });
            cells.push({ value: '[]', id: cellId });
            arrows.push([cellId, clusterId]);
          } else {
            cells.push({ value: cell, id: cellId });
          }
        }
        clusters.push({ cells, id: currentId });
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
                          <ArrayCell value={cell.value} theme={theme}/>
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
