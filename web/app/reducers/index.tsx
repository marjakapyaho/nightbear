import { Action } from 'app/actions';
import { assertExhausted } from 'app/utils/types';

export type ReplicationDirection = 'UP' | 'DOWN';
export type ReplicationState = 'DISABLED' | 'ACTIVE' | 'ONLINE' | 'OFFLINE' | 'ERROR';

export type State = Readonly<{
  config: {
    remoteDbUrl: string;
  };
  replication: {
    [direction in ReplicationDirection]: {
      state: ReplicationState;
      details: string;
    }
  };
}>;

export const defaultState: State = {
  config: {
    remoteDbUrl: '',
  },
  replication: {
    UP: {
      state: 'DISABLED',
      details: '',
    },
    DOWN: {
      state: 'DISABLED',
      details: '',
    },
  },
};

export function rootReducer(state: State = defaultState, action: Action): State {
  switch (action.type) {
    case '@@INIT':
      return state;
    case 'DB_URL_SET':
      return { ...state, config: { ...state.config, remoteDbUrl: action.newDbUrl } };
    case 'DB_EMITTED_CHANGE':
      return updateReplicationState(
        state,
        action.direction,
        'ACTIVE',
        action.info.pending ? `${action.info.pending} docs left...` : '',
      );
    case 'DB_EMITTED_PAUSED':
      return updateReplicationState(state, action.direction, action.err ? 'OFFLINE' : 'ONLINE');
    case 'DB_EMITTED_ACTIVE':
      return updateReplicationState(state, action.direction, 'ACTIVE');
    case 'DB_EMITTED_DENIED':
      return updateReplicationState(state, action.direction, 'ERROR', action.err.message);
    case 'DB_EMITTED_COMPLETE':
      return updateReplicationState(state, action.direction, 'DISABLED');
    case 'DB_EMITTED_ERROR':
      return updateReplicationState(state, action.direction, 'ERROR', action.err.message);
    default:
      return assertExhausted(action);
  }
}

function updateReplicationState(
  state: State,
  direction: ReplicationDirection,
  replState: ReplicationState,
  details = '',
): State {
  return {
    ...state,
    replication: {
      ...state.replication,
      [direction]: { ...state.replication[direction], state: replState, details },
    },
  };
}
