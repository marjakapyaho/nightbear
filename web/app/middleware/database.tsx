import PouchDB from 'pouchdb';
import { Middleware, Dispatch } from 'app/utils/redux';
import { REPLICATION_DIRECTION } from 'app/actions';

export const database: Middleware = store => {
  let existingReplication: (() => void) | null = null;
  return next => action => {
    const oldValue = store.getState().config.remoteDbUrl;
    const result = next(action);
    const newValue = store.getState().config.remoteDbUrl;
    if (oldValue !== newValue) {
      if (existingReplication) {
        existingReplication();
        existingReplication = null;
      }
      if (newValue) {
        existingReplication = startReplication(newValue, store.dispatch);
      }
    }
    return result;
  };
};

function startReplication(remoteDbUrl: string, dispatch: Dispatch) {
  const localDb = new PouchDB('nightbear_web_ui');
  const remoteDb = new PouchDB(remoteDbUrl);
  const options = {
    live: true,
    retry: true,
    batch_size: 1000,
  };
  const upReplication = PouchDB.replicate(localDb, remoteDb, {
    ...options,
    checkpoint: 'source',
  });
  const downReplication = PouchDB.replicate(remoteDb, localDb, {
    ...options,
    checkpoint: 'target',
  });
  dispatchFromReplication(upReplication, 'up', dispatch);
  dispatchFromReplication(downReplication, 'down', dispatch);
  return () => {
    upReplication.cancel();
    downReplication.cancel();
  };
}

function dispatchFromReplication(
  replication: PouchDB.Replication.Replication<{}>,
  direction: REPLICATION_DIRECTION,
  dispatch: Dispatch,
) {
  replication
    .on('change', info =>
      dispatch({
        type: 'DB_EMITTED_CHANGE',
        direction,
        info,
      }),
    )
    .on('paused', err =>
      dispatch({
        type: 'DB_EMITTED_PAUSED',
        direction,
        err,
      }),
    )
    .on('active', () =>
      dispatch({
        type: 'DB_EMITTED_ACTIVE',
        direction,
      }),
    )
    .on('denied', err =>
      dispatch({
        type: 'DB_EMITTED_DENIED',
        direction,
        err,
      }),
    )
    .on('complete', info =>
      dispatch({
        type: 'DB_EMITTED_COMPLETE',
        direction,
        info,
      }),
    )
    .on('error', err =>
      dispatch({
        type: 'DB_EMITTED_ERROR',
        direction,
        err,
      }),
    );
}
