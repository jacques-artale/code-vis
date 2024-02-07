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
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        {
          scope.variables.map(([name, value], index) => {
            const updated = varChange !== null && scope.id === varChange.scopeId && varChange.properties === null && name === varChange.name;
            const created = varCreate !== null && scope.id === varCreate.scopeId && name === varCreate.name;
            const accessed = varAccess !== null && scope.id === varAccess.scopeId && name === varAccess.name;
            const highlightColor = updated ? '#0099ff' : created ? '#00ff00' : accessed ? '#ff0000' : 'transparent';
            return (
              <div
                key={`var-${index}`}
                style={{
                  margin: '10px',
                  backgroundColor: highlightColor
                }}>
                <Variable name={name} value={value} />
              </div>
            );
          })
        }
        {
          scope.arrayVariables.map(([name, arr], index) => {
            const highlight = varChange !== null && scope.id === varChange.scopeId && varChange.properties !== null && varChange.name === name;

            const updated = varChange !== null && scope.id === varChange.scopeId && varChange.properties === null && name === varChange.name;
            const created = varCreate !== null && scope.id === varCreate.scopeId && name === varCreate.name;
            const accessed = varAccess !== null && scope.id === varAccess.scopeId && name === varAccess.name;
            const highlightColor = updated ? '#0099ff' : created ? '#00ff00' : accessed ? '#ff0000' : 'transparent';
            return (
              <div
                key={`array-${index}`}
                style={{
                  margin: '10px',
                  backgroundColor: highlightColor
                }}
              >
                <ArrayGrid name={name} values={arr} varChange={highlight ? varChange : null} theme={theme}/>
              </div>
            );
          })
        }
      </div>
    </div>
  );
}

export default Scope;
