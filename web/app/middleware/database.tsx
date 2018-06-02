import PouchDB from 'pouchdb';
import { Middleware, Dispatch } from 'app/utils/redux';
import { ReplicationDirection } from 'app/reducers';
import { debounce } from 'lodash';

const LOCAL_DB_ACTIVE_DEBOUNCE = 100;
export const DB_REPLICATION_BATCH_SIZE = 500;

export const database: Middleware = store => {
  let existingReplication: ReturnType<typeof startReplication> | null;
  return next => action => {
    const oldValue = store.getState().config.remoteDbUrl;
    const result = next(action);
    const newValue = store.getState().config.remoteDbUrl;
    if (oldValue !== newValue) {
      if (existingReplication) {
        existingReplication.dispose();
        existingReplication = null;
      }
      if (newValue) {
        existingReplication = startReplication(newValue, store.dispatch);
      }
    }
    if (action.type === 'TIMELINE_DATA_REQUESTED' && existingReplication) {
      queryTimelineData(existingReplication.localDb).then(res =>
        console.log('Results from DB:', res),
      );
    }
    return result;
  };
};

function queryTimelineData(db: PouchDB.Database<{}>) {
  return db
    .allDocs({
      include_docs: true,
      limit: 100,
      descending: true,
      start_key: 'timeline/_',
      end_key: 'timeline/',
    } as any)
    .then(res => res.rows.map(row => row.doc));
}

function startReplication(remoteDbUrl: string, dispatch: Dispatch) {
  const isSafari = // https://stackoverflow.com/a/31732310 ;__;
    navigator.vendor &&
    navigator.vendor.indexOf('Apple') > -1 &&
    navigator.userAgent &&
    !navigator.userAgent.match('CriOS');
  const pouchDb7057Workaround = isSafari ? { adapter: 'websql' } : undefined; // https://github.com/pouchdb/pouchdb/issues/7057 ;__;
  const localDb = new PouchDB('nightbear_web_ui', pouchDb7057Workaround);
  const remoteDb = new PouchDB(remoteDbUrl);
  // Start replication in both directions:
  const replOptions = {
    live: true,
    retry: true,
    batch_size: DB_REPLICATION_BATCH_SIZE,
  };
  const upReplication = PouchDB.replicate(localDb, remoteDb, {
    ...replOptions,
    checkpoint: 'source',
  });
  const downReplication = PouchDB.replicate(remoteDb, localDb, {
    ...replOptions,
    checkpoint: 'target',
  });
  dispatchFromReplication(upReplication, 'UP', dispatch);
  dispatchFromReplication(downReplication, 'DOWN', dispatch);
  // Start changes feed, but ONLY after replications have finished (otherwise it'll be crazy noisy):
  let changes: PouchDB.Core.Changes<{}> | null = null;
  Promise.all([
    eventToPromise(upReplication, 'paused'),
    eventToPromise(downReplication, 'paused'),
  ]).then(() => {
    changes = localDb.changes({
      live: true,
      since: 'now',
      return_docs: false,
    });
    dispatchFromChanges(changes, dispatch);
  });
  // Return our DB's & a dispose function:
  return {
    localDb,
    remoteDb,
    dispose() {
      if (changes) changes.cancel();
      upReplication.cancel();
      downReplication.cancel();
    },
  };
}

function eventToPromise(emitter: EventEmitter, event: string): Promise<null> {
  return new Promise(resolve => emitter.once(event, resolve)).then(() => null);
}

function dispatchFromChanges(changeFeed: PouchDB.Core.Changes<{}>, dispatch: Dispatch) {
  const postChangeReady = debounce(
    () =>
      dispatch({
        type: 'DB_EMITTED_READY',
      }),
    LOCAL_DB_ACTIVE_DEBOUNCE,
  );
  dispatch({
    type: 'DB_EMITTED_READY',
  });
  changeFeed
    .on('change', change => {
      dispatch({
        type: 'DB_EMITTED_CHANGE',
        change,
      });
      postChangeReady();
    })
    .on('complete', info => {
      dispatch({
        type: 'DB_EMITTED_COMPLETE',
        info,
      });
      postChangeReady.cancel();
    })
    .on('error', err => {
      dispatch({
        type: 'DB_EMITTED_ERROR',
        err,
      });
      postChangeReady.cancel();
    });
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
