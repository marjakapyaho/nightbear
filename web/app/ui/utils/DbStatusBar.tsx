import { renderFromStore } from 'app/utils/react';
import { State, DbState, DbStatePart } from 'app/reducers';
import { CSSProperties } from 'react';
import { assertExhausted, objectKeys } from 'app/utils/types';

export default renderFromStore(
  __filename,
  state => state,
  (React, { dbState }) => {
    const parts = objectKeys(dbState);
    return <div className="this">{parts.map(part => renderState(part, dbState[part]))}</div>;
    function renderState(part: DbStatePart, state: State['dbState'][DbStatePart]) {
      return (
        <div key={part} className="dir" style={getStyle(state.state)}>
          {part}: {state.state} {state.details}
        </div>
      );
    }
  },
);

function getStyle(state: DbState): CSSProperties {
  switch (state) {
    case 'DISABLED':
      return {
        background: 'white',
        color: 'gray',
      };
    case 'ACTIVE':
      return {
        background: 'green',
        color: 'white',
      };
    case 'ONLINE':
      return {
        background: 'gray',
        color: 'white',
      };
    case 'OFFLINE':
      return {
        background: 'orange',
        color: 'black',
      };
    case 'ERROR':
      return {
        background: 'darkred',
        color: 'white',
      };
    default:
      return assertExhausted(state);
  }
}
