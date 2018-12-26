import { TimelineModelType } from 'core/models/model';
import {
  createCouchDbStorage,
  HIGH_UNICODE_TERMINATOR,
  PREFIX_GLOBAL,
  PREFIX_TIMELINE,
} from 'core/storage/couchDbStorage';
import PouchDB from 'core/storage/PouchDb';
import { debounce, flatten } from 'lodash';
import { DateTime } from 'luxon';
import { actions } from 'web/app/modules/actions';
import { ReplicationDirection } from 'web/app/modules/pouchDb/state';
import { createChangeObserver, ReduxDispatch, ReduxMiddleware } from 'web/app/utils/redux';

export const LOCAL_DB_NAME = 'nightbear_web_ui';
export const LOCAL_DB_CHANGES_BUFFER = 500;
export const DB_REPLICATION_BATCH_SIZE = 250;
export const MODELS_FETCH_DEBOUNCE = 100;

const LOCAL_REPLICATION_RANGE = 'month'; // one of [ 'year', 'month', 'day', 'hour', 'minute', 'second', 'millisecond' ] (https://moment.github.io/luxon/docs/class/src/datetime.js~DateTime.html#instance-method-startOf)

export const pouchDbMiddleware: ReduxMiddleware = store => {
  let existingReplication: ReturnType<typeof startReplication> | null;

  return next => {
    const observer = createChangeObserver(store, next);
    observer.add(state => state.configVars.remoteDbUrl, remoteDbUrlChanged);
    observer.add(
      state =>
        state.uiNavigation.selectedScreen === 'TimelineDebugScreen'
          ? ([
              state.uiNavigation.selectedModelTypes,
              state.uiNavigation.timelineRange,
              state.uiNavigation.timelineRangeEnd,
            ] as [TimelineModelType[], number, number])
          : null,
      timelineFiltersChanged,
    );
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

  function timelineFiltersChanged(args: [TimelineModelType[], number, number] | null) {
    if (!existingReplication || !args) return;
    const [selectedModelTypes, timelineRange, timelineRangeEnd] = args;
    Promise.all(
      selectedModelTypes.map(
        modelType =>
          existingReplication
            ? existingReplication.storage.loadTimelineModels(
                modelType,
                timelineRange,
                timelineRangeEnd,
              )
            : Promise.resolve([]), // this should be impossible, since the map() is synchronous, but we wouldn't be type safe without it
      ),
    ).then(
      models => store.dispatch(actions.TIMELINE_DATA_RECEIVED(flatten(models))),
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
    .minus({ days: 1 }) // ensure that even if you replicate for the first time at the start of LOCAL_REPLICATION_RANGE, you still have at least 1 days' worth of data locally
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
