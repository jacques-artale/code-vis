import React from 'react';
import './../../styles/Scope.css';

import Variable from './Variable';
import ArrayGrid from './Array';

const Scope = ({ scope, theme, varChange, varCreate, varAccess }) => {
  return (
    <div className={`${theme}-scope-container${scope.active ? '-active' : ''}`}>
      <div className={`${theme}-scope-header`}>
        <p className={`${theme}-scope-name`}>{scope.name}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
        {
          scope.variables.map(([name, value], index) => {
            const highlight = varChange !== null && scope.id === varChange.scopeId && varChange.properties !== null && varChange.name === name;

            const updated = varChange !== null && scope.id === varChange.scopeId && varChange.properties === null && name === varChange.name;
            const created = varCreate !== null && scope.id === varCreate.scopeId && name === varCreate.name;
            const accessed = varAccess !== null && scope.id === varAccess.scopeId && name === varAccess.name;
            return (
              <div
                key={`var-${index}`}
                style={{
                  margin: '10px',
                }}
              >
                <Variable
                  name={name}
                  value={value}
                  varChange={highlight ? varChange : null}
                  created={created}
                  updated={updated}
                  accessed={accessed}
                />
              </div>
            );
          })
        }
        {
          scope.arrayVariables.map(([name, arr], index) => {
            const highlightCellUpdate = varChange !== null && scope.id === varChange.scopeId && varChange.properties !== null && varChange.name === name;
            const highlightCellAccess = varAccess !== null && scope.id === varAccess.scopeId && varAccess.properties !== null && varAccess.name === name;

            const updated = varChange !== null && scope.id === varChange.scopeId && varChange.properties === null && name === varChange.name;
            const created = varCreate !== null && scope.id === varCreate.scopeId && name === varCreate.name;
            const accessed = varAccess !== null && scope.id === varAccess.scopeId && varAccess.properties === null && name === varAccess.name;
            const highlightColor = updated ? '#0099ff' : created ? '#378805' : accessed ? '#e6b400' : 'transparent';
            return (
              <div
                key={`array-${index}`}
                style={{
                  margin: '10px',
                  backgroundColor: highlightColor
                }}
              >
                <ArrayGrid
                  scope={scope.id}
                  name={name}
                  values={arr}
                  varChange={highlightCellUpdate ? varChange : null}
                  varAccess={highlightCellAccess ? varAccess : null}
                  created={created}
                  updated={updated}
                  accessed={accessed}
                  theme={theme}
                />
              </div>
            );
          })
        }
      </div>
    </div>
  );
}

export default Scope;
