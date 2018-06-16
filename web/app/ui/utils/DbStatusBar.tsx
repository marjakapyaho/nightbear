import { renderFromStore } from 'web/app/utils/react';
import { CSSProperties } from 'react';
import { assertExhausted, objectKeys } from 'web/app/utils/types';
import { getSummaryDbStatus, getSummaryReplicationProgress } from 'web/app/modules/pouchDb/getters';
import { PouchDbState, PouchDbStatePart, PouchDbStatus } from 'web/app/modules/pouchDb/state';

export default renderFromStore(
  __filename,
  state => state,
  (React, { pouchDb }) => {
    const parts = objectKeys(pouchDb);
    const summaryState = getSummaryDbStatus(parts.map(key => pouchDb[key].status));
    const summaryProgress = getSummaryReplicationProgress(parts.map(key => pouchDb[key]));
    return (
      <div className="this">
        <div className="parts">{parts.map(part => renderState(part, pouchDb[part]))}</div>
        <div className="summary" style={getStyle(summaryState)}>
          {summaryState} {summaryProgress === null ? null : `(${summaryProgress} %)`}
        </div>
      </div>
    );
    function renderState(part: PouchDbStatePart, state: PouchDbState[PouchDbStatePart]) {
      return (
        <div key={part} className="dir" style={getStyle(state.status)}>
          {part}: {state.status}
        </div>
      );
    }
  },
);

function getStyle(state: PouchDbStatus): CSSProperties {
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
