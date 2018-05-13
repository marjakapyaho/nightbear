import PouchDB from 'pouchdb';
import { Middleware, Dispatch } from 'app/utils/redux';
import { ReplicationDirection } from 'app/reducers';

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
  const isSafari = // https://stackoverflow.com/a/31732310 ;__;
    navigator.vendor &&
    navigator.vendor.indexOf('Apple') > -1 &&
    navigator.userAgent &&
    !navigator.userAgent.match('CriOS');
  const pouchDb7057Workaround = isSafari ? { adapter: 'websql' } : undefined; // https://github.com/pouchdb/pouchdb/issues/7057 ;__;
  const localDb = new PouchDB('nightbear_web_ui', pouchDb7057Workaround);
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
  dispatchFromReplication(upReplication, 'UP', dispatch);
  dispatchFromReplication(downReplication, 'DOWN', dispatch);
  return () => {
    upReplication.cancel();
    downReplication.cancel();
  };
}

function dispatchFromReplication(
  replication: PouchDB.Replication.Replication<{}>,
  direction: ReplicationDirection,
  dispatch: Dispatch,
) {
  replication
    .on('change', info =>
      dispatch({
        type: 'REPLICATION_EMITTED_CHANGE',
        direction,
        info,
      }),
    )
    .on('paused', err =>
      dispatch({
        type: 'REPLICATION_EMITTED_PAUSED',
        direction,
        err,
      }),
    )
    .on('active', () =>
      dispatch({
        type: 'REPLICATION_EMITTED_ACTIVE',
        direction,
      }),
    )
    .on('denied', err =>
      dispatch({
        type: 'REPLICATION_EMITTED_DENIED',
        direction,
        err,
      }),
    )
    .on('complete', info =>
      dispatch({
        type: 'REPLICATION_EMITTED_COMPLETE',
        direction,
        info,
      }),
    )
    .on('error', err =>
      dispatch({
        type: 'REPLICATION_EMITTED_ERROR',
        direction,
        err,
      }),
    );
}
