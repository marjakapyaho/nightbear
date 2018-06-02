import { renderFromStore } from 'nightbear/web/app/utils/react';
import {
  State,
  DbState,
  DbStatePart,
  getSummaryDbState,
  getSummaryReplicationProgress,
} from 'nightbear/web/app/reducers';
import { CSSProperties } from 'react';
import { assertExhausted, objectKeys } from 'nightbear/web/app/utils/types';

export default renderFromStore(
  __filename,
  state => state,
  (React, { dbState }) => {
    const parts = objectKeys(dbState);
    const summaryState = getSummaryDbState(parts.map(key => dbState[key].state));
    const summaryProgress = getSummaryReplicationProgress(parts.map(key => dbState[key]));
    return (
      <div className="this">
        <div className="parts">{parts.map(part => renderState(part, dbState[part]))}</div>
        <div className="summary" style={getStyle(summaryState)}>
          {summaryState} {summaryProgress === null ? null : `(${summaryProgress} %)`}
        </div>
      </div>
    );
    function renderState(part: DbStatePart, state: State['dbState'][DbStatePart]) {
      return (
        <div key={part} className="dir" style={getStyle(state.state)}>
          {part}: {state.state}
        </div>
      );
    }
  },
);

function getStyle(state: DbState): CSSProperties {
  switch (state) {
    case 'DISABLED':
      return {
        background: 'darkgray',
        color: 'gray',
      };
    case 'ACTIVE':
      return {
        background: 'green',
        color: 'white',
      };
    case 'ONLINE':
      return {
        background: 'darkgreen',
        color: 'white',
      };
    case 'OFFLINE':
      return {
        background: 'lightgray',
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
