import { Action } from 'app/actions';
import { assertExhausted } from 'app/utils/types';

export type ReplicationDirection = 'UP' | 'DOWN';
export type DbStatePart = ReplicationDirection | 'LOCAL';
export type DbState = 'DISABLED' | 'ACTIVE' | 'ONLINE' | 'OFFLINE' | 'ERROR';

export type State = Readonly<{
  config: {
    remoteDbUrl: string;
  };
  dbState: {
    [part in DbStatePart]: {
      state: DbState;
      details: string;
    }
  };
}>;

export const defaultState: State = {
  config: {
    remoteDbUrl: '',
  },
  dbState: {
    LOCAL: {
      state: 'DISABLED',
      details: '',
    },
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
  if (action.type.substr(0, 2) === '@@') return defaultState; // @see https://github.com/reduxjs/redux/issues/186
  switch (action.type) {
    case 'DB_URL_SET':
      return { ...state, config: { ...state.config, remoteDbUrl: action.newDbUrl } };
    case 'DB_EMITTED_READY':
      return updateDbState(state, 'LOCAL', 'ONLINE');
    case 'DB_EMITTED_CHANGE':
      return updateDbState(state, 'LOCAL', 'ACTIVE');
    case 'DB_EMITTED_COMPLETE':
      return updateDbState(state, 'LOCAL', 'DISABLED');
    case 'DB_EMITTED_ERROR':
      return updateDbState(state, 'LOCAL', 'ERROR', action.err.message);

    case 'REPLICATION_EMITTED_CHANGE':
      return updateDbState(
        state,
        action.direction,
        'ACTIVE',
        action.info.pending ? `${action.info.pending} docs left...` : '',
      );
    case 'REPLICATION_EMITTED_PAUSED':
      return updateDbState(state, action.direction, action.err ? 'OFFLINE' : 'ONLINE');
    case 'REPLICATION_EMITTED_ACTIVE':
      return updateDbState(state, action.direction, 'ACTIVE');
    case 'REPLICATION_EMITTED_DENIED':
      return updateDbState(state, action.direction, 'ERROR', action.err.message);
    case 'REPLICATION_EMITTED_COMPLETE':
      return updateDbState(state, action.direction, 'DISABLED');
    case 'REPLICATION_EMITTED_ERROR':
      return updateDbState(state, action.direction, 'ERROR', action.err.message);
    default:
      return assertExhausted(action);
  }
}

function updateDbState(state: State, part: DbStatePart, newState: DbState, details = ''): State {
  return {
    ...state,
    dbState: {
      ...state.dbState,
      [part]: { ...state.dbState[part], state: newState, details },
    },
  };
}
