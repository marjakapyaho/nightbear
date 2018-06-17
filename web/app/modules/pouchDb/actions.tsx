import { ReplicationDirection } from 'web/app/modules/pouchDb/state';
import { actionsWithType } from 'web/app/utils/redux';

export const pouchDbActions = actionsWithType({
  DB_EMITTED_CHANGES_BUFFERING: () => ({}),

  DB_EMITTED_CHANGES: (changes: Array<PouchDB.Core.ChangesResponseChange<{}>>) => ({
    changes,
  }),

  DB_EMITTED_COMPLETE: (info: PouchDB.Core.ChangesResponse<{}>) => ({
    info,
  }),

  DB_EMITTED_ERROR: (err: PouchDB.Core.Error) => ({
    err,
  }),

  // something (anything) happened within the context of this replication
  REPLICATION_EMITTED_CHANGE: (
    direction: ReplicationDirection,
    info: PouchDB.Replication.ReplicationResult<{}>,
  ) => ({
    direction,
    info,
  }),

  // replication paused (e.g. replication up to date, user went offline)
  REPLICATION_EMITTED_PAUSED: (
    direction: ReplicationDirection,
    err: PouchDB.Core.Error | undefined, // Error when e.g. offline, undefined when e.g. all caught up
  ) => ({
    direction,
    err,
  }),

  // replicate resumed (e.g. new changes replicating, user went back online)
  REPLICATION_EMITTED_ACTIVE: (direction: ReplicationDirection) => ({
    direction,
  }),

  // a document failed to replicate (e.g. due to permissions)
  REPLICATION_EMITTED_DENIED: (direction: ReplicationDirection, err: PouchDB.Core.Error) => ({
    direction,
    err,
  }),

  REPLICATION_EMITTED_COMPLETE: (
    direction: ReplicationDirection,
    info: PouchDB.Replication.ReplicationResultComplete<{}>,
  ) => ({
    direction,
    info,
  }),

  REPLICATION_EMITTED_ERROR: (direction: ReplicationDirection, err: PouchDB.Core.Error) => ({
    direction,
    err,
  }),
});
