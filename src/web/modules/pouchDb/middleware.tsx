import { TimelineModel, TimelineModelType } from 'core/models/model';
import { activateSavedProfile, is } from 'core/models/utils';
import {
  createCouchDbStorage,
  HIGH_UNICODE_TERMINATOR,
  PREFIX_GLOBAL,
  PREFIX_TIMELINE,
} from 'core/storage/couchDbStorage';
import PouchDB from 'core/storage/PouchDb';
import { Storage } from 'core/storage/storage';
import { reject } from 'core/utils/promise';
import { debounce, flatten } from 'lodash';
import { DateTime } from 'luxon';
import { actions, ReduxAction } from 'web/modules/actions';
import { ReplicationDirection } from 'web/modules/pouchDb/state';
import { createChangeObserver, ReduxDispatch, ReduxMiddleware } from 'web/utils/redux';

export const LOCAL_DB_NAME = 'nightbear_web_ui';
export const LOCAL_DB_CHANGES_BUFFER = 500;
export const DB_REPLICATION_BATCH_SIZE = 250;
export const MODELS_FETCH_DEBOUNCE = 100;

const LOCAL_REPLICATION_ENABLED = false;
const LOCAL_REPLICATION_RANGE = 'month'; // one of [ 'year', 'month', 'day', 'hour', 'minute', 'second', 'millisecond' ] (https://moment.github.io/luxon/docs/class/src/datetime.js~DateTime.html#instance-method-startOf)

export const pouchDbMiddleware: ReduxMiddleware = store => {
  let activeStorage: Storage | null;
  let activeReplication: ReturnType<typeof startReplication> | null;

  return next => {
    const observer = createChangeObserver(store, next);
    observer.add(state => state.config.remoteDbUrl, remoteDbUrlChanged);
    observer.add(
      state =>
        state.config.remoteDbUrl &&
        (state.navigation.selectedScreen === 'TimelineDebugScreen' ||
          state.navigation.selectedScreen === 'StatsScreen' ||
          state.navigation.selectedScreen === 'BgGraphScreen')
          ? ([
              state.navigation.selectedModelTypes,
              state.navigation.timelineRange,
              state.navigation.timelineRangeEnd,
            ] as [TimelineModelType[], number, number])
          : null,
      timelineFiltersChanged,
    );
    return (action: ReduxAction) => {
      if (action.type === actions.MODEL_UPDATED_BY_USER.type) {
        Promise.resolve()
          .then(() =>
            activeStorage
              ? activeStorage.saveModel(action.model)
              : reject(`Can't save Model changes without an active Storage`),
          )
          .then(
            (res: typeof action.model) => store.dispatch(actions.TIMELINE_DATA_UPDATED([res], [])),
            err => console.log('Save Model error:', err),
          );
      }
      if (action.type === actions.MODEL_DELETED_BY_USER.type) {
        Promise.resolve()
          .then(() =>
            activeStorage
              ? activeStorage.deleteModel(action.model)
              : reject(`Can't delete Model without an active Storage`),
          )
          .then(
            (res: typeof action.model) => store.dispatch(actions.TIMELINE_DATA_DELETED([res])),
            err => console.log('Delete Model error:', err),
          );
      }
      if (action.type === actions.PROFILE_ACTIVATED.type) {
        const activation = activateSavedProfile(action.profile, action.atTimestamp);
        Promise.resolve()
          .then(() =>
            activeStorage
              ? activeStorage.saveModel(activation)
              : reject(`Can't save ActiveProfile without an active Storage`),
          )
          .then(
            (res: typeof activation) => store.dispatch(actions.TIMELINE_DATA_UPDATED([res], [])),
            err => console.log('Save ActiveProfile error:', err),
          );
      }
      return observer.run(action); // run state change observers
    };
  };

  function remoteDbUrlChanged(newUrl: string) {
    if (activeReplication) {
      activeReplication.dispose();
      activeReplication = null;
    }
    if (newUrl) {
      if (LOCAL_REPLICATION_ENABLED) {
        activeReplication = startReplication(newUrl, store.dispatch);
        activeStorage = activeReplication.storage;
      } else {
        activeStorage = createCouchDbStorage(newUrl);
      }
    }
  }

  function timelineFiltersChanged(args: [TimelineModelType[], number, number] | null) {
    if (!activeStorage || !args) return;
    const [selectedModelTypes, timelineRange, timelineRangeEnd] = args;
    Promise.all([
      activeStorage ? activeStorage.loadGlobalModels() : Promise.resolve([]), // this should be impossible, since the map() is synchronous, but we wouldn't be type safe without it
      (activeStorage
        ? activeStorage.loadTimelineModels(selectedModelTypes, timelineRange, timelineRangeEnd)
        : Promise.resolve([])
      ) // ^ this should be impossible, since the map() is synchronous, but we wouldn't be type safe without it
        .then(models => flatten(models))
        .then(
          (models): Promise<TimelineModel[]> => {
            if (models.find(is('ActiveProfile'))) {
              console.log(`Results already contain at least one ActiveProfile -> no need to fetch more`);
              return Promise.resolve(models);
            } else {
              console.log(`ActiveProfile not found in results -> need to fetch one`);
              return Promise.resolve()
                .then(() =>
                  activeStorage
                    ? activeStorage.loadLatestTimelineModel('ActiveProfile')
                    : reject(`Can't load latest ActiveProfile without an active Storage`),
                )
                .then(activeProfile => {
                  if (activeProfile) {
                    return Promise.resolve([...models, activeProfile]);
                  } else {
                    console.log(`Warning: No ActiveProfile's found from the entire DB`);
                    // For the time being at least, let's just finish the load; otherwise it's hard to ever create the INITIAL ActiveProfile
                    return Promise.resolve(models);
                  }
                });
            }
          },
        ),
    ])
      .then(([globalModels, timelineModels]) =>
        store.dispatch(actions.TIMELINE_DATA_UPDATED(timelineModels, globalModels)),
      )
      .catch(err => store.dispatch(actions.TIMELINE_DATA_FAILED(err)));
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
  Promise.all([eventToPromise(upReplication, 'paused'), eventToPromise(downReplication, 'paused')]).then(() => {
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
