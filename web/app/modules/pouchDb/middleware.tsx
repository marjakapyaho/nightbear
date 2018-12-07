import PouchDB from 'core/storage/PouchDb';
import { ReduxMiddleware, ReduxDispatch, createChangeObserver } from 'web/app/utils/redux';
import { debounce } from 'lodash';
import {
  createCouchDbStorage,
  HIGH_UNICODE_TERMINATOR,
  PREFIX_GLOBAL,
  PREFIX_TIMELINE,
} from 'core/storage/couchDbStorage';
import { ReplicationDirection } from 'web/app/modules/pouchDb/state';
import { actions } from 'web/app/modules/actions';
import { ReduxState } from 'web/app/modules/state';
import { DateTime } from 'luxon';

export const LOCAL_DB_NAME = 'nightbear_web_ui';
export const LOCAL_DB_CHANGES_BUFFER = 500;
export const DB_REPLICATION_BATCH_SIZE = 250;
export const MODELS_FETCH_DEBOUNCE = 100;

const LOCAL_REPLICATION_RANGE = 'week'; // one of [ 'year', 'month', 'day', 'hour', 'minute', 'second', 'millisecond' ] (https://moment.github.io/luxon/docs/class/src/datetime.js~DateTime.html#instance-method-startOf)

export const pouchDbMiddleware: ReduxMiddleware = store => {
  let existingReplication: ReturnType<typeof startReplication> | null;
  const debouncedTimelineFiltersChanged = debounce(timelineFiltersChanged, MODELS_FETCH_DEBOUNCE);

  setTimeout(() => timelineFiltersChanged(store.getState().timelineData.filters), 0); // react to the initial filter values

  return next => {
    const observer = createChangeObserver(store, next);
    observer.add(state => state.configVars.remoteDbUrl, remoteDbUrlChanged);
    observer.add(state => state.timelineData.filters, debouncedTimelineFiltersChanged);
    return observer.run;
  };

  function remoteDbUrlChanged(newUrl: string) {
    if (existingReplication) {
      existingReplication.dispose();
      existingReplication = null;
    }
    if (newUrl) {
      existingReplication = startReplication(newUrl, store.dispatch);
    }
  }

  function timelineFiltersChanged(filters: ReduxState['timelineData']['filters']) {
    if (!existingReplication) return;
    existingReplication.storage
      .loadTimelineModels(filters.modelTypes[0], filters.range, filters.rangeEnd)
      .then(
        models => store.dispatch(actions.TIMELINE_DATA_RECEIVED(models)),
        err => store.dispatch(actions.TIMELINE_DATA_FAILED(err)),
      );
  }
};

function startReplication(remoteDbUrl: string, dispatch: ReduxDispatch) {
  const isSafari = // https://stackoverflow.com/a/31732310 ;__;
    navigator.vendor &&
    navigator.vendor.indexOf('Apple') > -1 &&
    navigator.userAgent &&
    !navigator.userAgent.match('CriOS');
  const pouchDb7057Workaround = isSafari ? { adapter: 'websql' } : undefined; // https://github.com/pouchdb/pouchdb/issues/7057 ;__;
  const storage = createCouchDbStorage(LOCAL_DB_NAME, pouchDb7057Workaround);
  const localDb = new PouchDB(LOCAL_DB_NAME, pouchDb7057Workaround);
  const remoteDb = new PouchDB(remoteDbUrl);
  // Start replication in both directions:
  const replOptions = {
    live: true,
    retry: true,
    batch_size: DB_REPLICATION_BATCH_SIZE,
  };
  const replStartDate = DateTime.local()
    .startOf(LOCAL_REPLICATION_RANGE)
    .toFormat('yyyy-MM-dd');
  const upReplication = PouchDB.replicate(localDb, remoteDb, {
    ...replOptions,
    checkpoint: 'source',
  });
  const downReplication = PouchDB.replicate(remoteDb, localDb, {
    ...replOptions,
    checkpoint: 'target',
    selector: {
      // Because the remote DB can be huge, limit the docs that will be replicated to the local DB
      $or: [
        {
          _id: {
            $gt: `${PREFIX_GLOBAL}/`,
            $lt: `${PREFIX_GLOBAL}/${HIGH_UNICODE_TERMINATOR}`,
          },
        },
        {
          _id: {
            $gt: `${PREFIX_TIMELINE}/${replStartDate}`,
            $lt: `${PREFIX_TIMELINE}/${HIGH_UNICODE_TERMINATOR}`,
          },
        },
      ],
    },
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
      include_docs: true,
    });
    dispatchFromChanges(changes, dispatch);
  });
  // Return our DB's & a dispose function:
  return {
    storage,
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

function dispatchFromChanges(changeFeed: PouchDB.Core.Changes<{}>, dispatch: ReduxDispatch) {
  let changes: Array<PouchDB.Core.ChangesResponseChange<{}>> = [];
  const changeBuffer = debounce(() => {
    dispatch(actions.DB_EMITTED_CHANGES(changes));
    changes = [];
  }, LOCAL_DB_CHANGES_BUFFER);
  dispatch(actions.DB_EMITTED_CHANGES([]));
  changeFeed
    .on('change', change => {
      if (!changes.length) dispatch(actions.DB_EMITTED_CHANGES_BUFFERING());
      changes.push(change);
      changeBuffer();
    })
    .on('complete', info => {
      changeBuffer.flush();
      dispatch(actions.DB_EMITTED_COMPLETE(info));
    })
    .on('error', err => {
      changeBuffer.flush();
      dispatch(actions.DB_EMITTED_ERROR(err));
    });
}

function dispatchFromReplication(
  replication: PouchDB.Replication.Replication<{}>,
  direction: ReplicationDirection,
  dispatch: ReduxDispatch,
) {
  replication
    .on('change', info => dispatch(actions.REPLICATION_EMITTED_CHANGE(direction, info)))
    .on('paused', err => dispatch(actions.REPLICATION_EMITTED_PAUSED(direction, err)))
    .on('active', () => dispatch(actions.REPLICATION_EMITTED_ACTIVE(direction)))
    .on('denied', err => dispatch(actions.REPLICATION_EMITTED_DENIED(direction, err)))
    .on('complete', info => dispatch(actions.REPLICATION_EMITTED_COMPLETE(direction, info)))
    .on('error', err => dispatch(actions.REPLICATION_EMITTED_ERROR(direction, err)));
}
