import React, { useState, useEffect } from 'react';
import Xarrow from 'react-xarrows';

import Cluster from './Cluster';

const ArrayTree = ({ scope, values, varUpdate, varAccess, theme }) => {

  const [changed, setChanged] = useState(null); // id of the cell to highlight
  const [accessed, setAccessed] = useState(null); // id of the cell to highlight

  const valuesWithIds = assignCellId(values);

  /**
   * Highlight the cell that was changed
   */
  useEffect(() => {
    if (varUpdate !== null && varUpdate.properties !== null && values !== null) {
      let currentCell = { value: valuesWithIds };
      for (let i = 0; i < varUpdate.properties.length; i++) {
        currentCell = currentCell.value[varUpdate.properties[i]];
      }
      setChanged(currentCell.id);
    }
  }, [varUpdate, values]);

  /**
   * Highlight the cell that was accessed
   */
  useEffect(() => {
    if (varAccess !== null && varAccess.properties !== null && values !== null) {
      let currentCell = { value: valuesWithIds };
      for (let i = 0; i < varAccess.properties.length; i++) {
        currentCell = currentCell.value[varAccess.properties[i]];
      }
      setAccessed(currentCell.id);
    }
  }, [varAccess, values]);

  /**
   * Assigns a unique ID to each cell in the given array tree.
   *
   * @param {Array} arr - The array tree to assign IDs to.
   * @returns {Array} - The array tree with assigned IDs.
   */
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
                    return <Cluster
                      key={`cluster-${cluster.id}`}
                      scope={scope}
                      cluster={cluster}
                      clusterIndex={clusterIndex}
                      varUpdate={varUpdate}
                      varAccess={varAccess}
                      changed={changed}
                      accessed={accessed}
                      theme={theme}
                    />
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
                start={`${scope}-cell-${arrow[0]}`}
                end={`${scope}-cluster-${arrow[1]}`}
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
