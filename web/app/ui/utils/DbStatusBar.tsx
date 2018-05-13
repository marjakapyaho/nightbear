import { renderFromStore } from 'app/utils/react';
import { State, ReplicationDirection, ReplicationState } from 'app/reducers';
import { CSSProperties } from 'react';
import { assertExhausted } from 'app/utils/types';

export default renderFromStore(
  __filename,
  state => state.replication,
  (React, { UP, DOWN }) => {
    return (
      <div className="this">
        {renderState('UP', UP)}
        {renderState('DOWN', DOWN)}
      </div>
    );
    function renderState(
      dir: ReplicationDirection,
      state: State['replication'][ReplicationDirection],
    ) {
      return (
        <div className="dir" style={getStyle(state.state)}>
          {dir}: {state.state} {state.details}
        </div>
      );
    }
  },
);

function getStyle(state: ReplicationState): CSSProperties {
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
