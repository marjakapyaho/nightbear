import { CSSProperties } from 'react';
import { getSummaryDbStatus, SummaryDbStatus } from 'web/app/modules/pouchDb/getters';
import { PouchDbState, PouchDbStatePart } from 'web/app/modules/pouchDb/state';
import Timestamp from 'web/app/ui/utils/Timestamp';
import { renderFromStore } from 'web/app/utils/react';
import { assertExhausted, objectKeys } from 'web/app/utils/types';

export default renderFromStore(
  __filename,
  state => state,
  (React, { pouchDb }) => {
    const parts = objectKeys(pouchDb);
    const { summaryStatus, summaryProgress, summaryLastChangedAt } = getSummaryDbStatus(pouchDb);
    return (
      <div className="this">
        <div className="parts">{parts.map(part => renderState(part, pouchDb[part]))}</div>
        <div className="summary" style={getStyle(summaryStatus)}>
          {summaryStatus} {summaryProgress === null ? null : `(${summaryProgress} %)`}
          (since <Timestamp ts={summaryLastChangedAt} />)
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

function getStyle(state: SummaryDbStatus): CSSProperties {
  switch (state) {
    case 'DISABLED':
      return {
        background: 'darkgray',
        color: 'gray',
      };
    case 'REPLICATION_INITIAL':
    case 'REPLICATION_CATCHUP':
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
