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
                style={{ margin: '10px' }}
              >
                <Variable
                  name={name}
                  value={value}
                  varChange={highlight ? varChange : null} // TODO: Remove. Used to highlight property of object but also sent with 'varUpdate'
                  varCreate={created ? varCreate : null}
                  varUpdate={updated ? varChange : null}
                  varAccess={accessed ? varAccess : null}
                />
              </div>
            );
          })
        }
        {
          scope.arrayVariables.map(([name, arr], index) => {
            const created = varCreate !== null && varCreate.scopeId === scope.id && varCreate.name === name;
            const updated = varChange !== null && varChange.scopeId === scope.id && varChange.name === name;
            const accessed = varAccess !== null && varAccess.scopeId === scope.id && varAccess.name === name;

            return (
              <div
                key={`array-${index}`}
                style={{ margin: '10px' }}
              >
                <ArrayGrid
                  scope={scope.id}
                  name={name}
                  values={arr}
                  varCreate={created ? varCreate : null}
                  varUpdate={updated ? varChange : null}
                  varAccess={accessed ? varAccess : null}
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
