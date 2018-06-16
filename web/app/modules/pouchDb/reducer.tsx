import { ReduxAction } from 'web/app/modules/actions';
import { ReduxState } from 'web/app/modules/state';
import {
  pouchDbInitState,
  PouchDbState,
  PouchDbStatePart,
  PouchDbStatus,
} from 'web/app/modules/pouchDb/state';
import { isArray } from 'lodash';
import { assertNumber } from 'web/app/utils/types';
import { DB_REPLICATION_BATCH_SIZE } from 'web/app/modules/pouchDb/middleware';

export function pouchDbReducer(
  state: PouchDbState = pouchDbInitState,
  action: ReduxAction,
  _rootState: ReduxState,
): PouchDbState {
  switch (action.type) {
    case 'DB_EMITTED_READY':
      return updateDbStatus(state, 'LOCAL', 'ONLINE');
    case 'DB_EMITTED_COMPLETE':
      return updateDbStatus(state, 'LOCAL', 'DISABLED');
    case 'DB_EMITTED_ERROR':
      return updateDbStatus(state, 'LOCAL', 'ERROR', action.err.message);
    case 'REPLICATION_EMITTED_CHANGE':
      if (action.info.pending) {
        // We know how much replication work is left!
        const total = isArray(state[action.direction].details)
          ? assertNumber(state[action.direction].details[1]) // this isn't the first batch, so use the "total" from the previous action
          : action.info.pending + DB_REPLICATION_BATCH_SIZE; // this is the first batch, but since it's finished, the total needs to include the already-finished batch too
        return updateDbStatus(state, action.direction, 'ACTIVE', [
          Math.min(total - action.info.pending, total),
          total,
        ]);
      } else {
        // We only know the replication is active, but not how much is left
        return updateDbStatus(state, action.direction, 'ACTIVE');
      }
    case 'REPLICATION_EMITTED_PAUSED':
      return updateDbStatus(state, action.direction, action.err ? 'OFFLINE' : 'ONLINE');
    case 'REPLICATION_EMITTED_ACTIVE':
      return updateDbStatus(state, action.direction, 'ACTIVE');
    case 'REPLICATION_EMITTED_DENIED':
      return updateDbStatus(state, action.direction, 'ERROR', action.err.message);
    case 'REPLICATION_EMITTED_COMPLETE':
      return updateDbStatus(state, action.direction, 'DISABLED');
    case 'REPLICATION_EMITTED_ERROR':
      return updateDbStatus(state, action.direction, 'ERROR', action.err.message);
    default:
      return state;
  }
}

function updateDbStatus(
  state: PouchDbState,
  part: PouchDbStatePart,
  newStatus: PouchDbStatus,
  details: PouchDbState[PouchDbStatePart]['details'] = '',
): PouchDbState {
  return {
    ...state,
    [part]: { ...state[part], status: newStatus, details },
  };
}
