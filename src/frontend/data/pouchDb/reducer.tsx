import { isArray, last } from 'lodash';
import { ReduxAction, actions } from 'frontend/data/actions';
import { DB_REPLICATION_BATCH_SIZE } from 'frontend/data/pouchDb/middleware';
import { pouchDbInitState, PouchDbState, PouchDbStatePart, PouchDbStatus } from 'frontend/data/pouchDb/state';
import { ReduxState } from 'frontend/data/state';
import { assertNumber } from 'frontend/utils/types';

export function pouchDbReducer(
  state: PouchDbState = pouchDbInitState,
  action: ReduxAction,
  _rootState: ReduxState,
): PouchDbState {
  switch (action.type) {
    case actions.DB_EMITTED_CHANGES_BUFFERING.type:
      return updateDbStatus(state, 'LOCAL', 'ACTIVE');
    case actions.DB_EMITTED_CHANGES.type:
      return updateDbStatus(state, 'LOCAL', 'ONLINE');
    case actions.DB_EMITTED_COMPLETE.type:
      return updateDbStatus(state, 'LOCAL', 'DISABLED');
    case actions.DB_EMITTED_ERROR.type:
      return updateDbStatus(state, 'LOCAL', 'ERROR', action.err.message);
    case actions.REPLICATION_EMITTED_CHANGE.type:
      if (action.info.pending) {
        // We know how much replication work is left!
        const { details } = state[action.direction];
        const total = isArray(details)
          ? assertNumber(last(details)) // this isn't the first batch, so use the "total" from the previous action
          : action.info.pending + DB_REPLICATION_BATCH_SIZE; // this is the first batch, but since it's finished, the total needs to include the already-finished batch too
        return updateDbStatus(state, action.direction, 'ACTIVE', [Math.min(total - action.info.pending, total), total]);
      } else {
        // We only know the replication is active, but not how much is left
        return updateDbStatus(state, action.direction, 'ACTIVE');
      }
    case actions.REPLICATION_EMITTED_PAUSED.type:
      return updateDbStatus(state, action.direction, action.err ? 'OFFLINE' : 'ONLINE');
    case actions.REPLICATION_EMITTED_ACTIVE.type:
      return updateDbStatus(state, action.direction, 'ACTIVE');
    case actions.REPLICATION_EMITTED_DENIED.type:
      return updateDbStatus(state, action.direction, 'ERROR', action.err.message);
    case actions.REPLICATION_EMITTED_COMPLETE.type:
      return updateDbStatus(state, action.direction, 'DISABLED');
    case actions.REPLICATION_EMITTED_ERROR.type:
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
    [part]: { ...state[part], status: newStatus, details, lastChangedAt: Date.now() },
  };
}
