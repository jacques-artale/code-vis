import React from 'react';

import ArrayCell from './ArrayCell';

const Cluster = ({ scope, cluster, clusterIndex, varUpdate, varAccess, changed, accessed, theme }) => {
  /** If cluster is an empty array we display '[]' */
  if (cluster.cells.length === 0) {
    return (
      <div key={`${scope}-cluster-${cluster.id}`} id={`${scope}-cluster-${cluster.id}`}>
        <p style={{ margin: 0 }}>[]</p>
      </div>
    );
  }
  /** Display cluster */
  return (
    <div key={`cluster-${cluster.id}`} style={{ display: 'flex', flexDirection: 'row' }}>
      {/* Index numbers for each cell */}
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: `${clusterIndex !== 0 ? 20 : 0}px` }}>
        {
          cluster.cells.map((cell, cellIndex) => {
            return (
              <div key={`cell-index-${cell.id}`} style={{ width: '25px', height: '25px', display: 'flex', justifyContent: 'center' }}>
                <p style={{ margin: 0 }}>{cellIndex}</p>
              </div>
            )
          })
        }
      </div>
      {/* Cells in the cluster */}
      <div id={`${scope}-cluster-${cluster.id}`} style={{ marginTop: `${clusterIndex !== 0 ? 20 : 0}px` }}>
        {
          cluster.cells.map((cell) => {
            return (
              <div key={`cell-${cell.id}`} style={{ display: 'flex', flexDirection: 'row' }}>
                <div id={`${scope}-cell-${cell.id}`}>
                  <ArrayCell
                    value={cell.value}
                    theme={theme}
                    varUpdate={changed === cell.id ? varUpdate : null}
                    varAccess={accessed === cell.id ? varAccess : null}
                  />
                </div>
              </div>
            );
          })
        }
      </div>
    </div>
  );
}

export default Cluster;