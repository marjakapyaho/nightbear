import { ReplicationDirection } from 'web/app/modules/pouchDb/state';
import { actionsWithType } from 'web/app/utils/redux';

export const pouchDbActions = actionsWithType({
  DB_EMITTED_READY: () => ({
    type: 'DB_EMITTED_READY' as 'DB_EMITTED_READY',
  }),

  DB_EMITTED_CHANGE: (change: PouchDB.Core.ChangesResponseChange<{}>) => ({
    type: 'DB_EMITTED_CHANGE' as 'DB_EMITTED_CHANGE',
    change,
  }),

  DB_EMITTED_COMPLETE: (info: PouchDB.Core.ChangesResponse<{}>) => ({
    type: 'DB_EMITTED_COMPLETE' as 'DB_EMITTED_COMPLETE',
    info,
  }),

  DB_EMITTED_ERROR: (err: PouchDB.Core.Error) => ({
    type: 'DB_EMITTED_ERROR' as 'DB_EMITTED_ERROR',
    err,
  }),

  // something (anything) happened within the context of this replication
  REPLICATION_EMITTED_CHANGE: (
    direction: ReplicationDirection,
    info: PouchDB.Replication.ReplicationResult<{}>,
  ) => ({
    type: 'REPLICATION_EMITTED_CHANGE' as 'REPLICATION_EMITTED_CHANGE',
    direction,
    info,
  }),

  // replication paused (e.g. replication up to date, user went offline)
  REPLICATION_EMITTED_PAUSED: (
    direction: ReplicationDirection,
    err: PouchDB.Core.Error | undefined, // Error when e.g. offline, undefined when e.g. all caught up
  ) => ({
    type: 'REPLICATION_EMITTED_PAUSED' as 'REPLICATION_EMITTED_PAUSED',
    direction,
    err,
  }),

  // replicate resumed (e.g. new changes replicating, user went back online)
  REPLICATION_EMITTED_ACTIVE: (direction: ReplicationDirection) => ({
    type: 'REPLICATION_EMITTED_ACTIVE' as 'REPLICATION_EMITTED_ACTIVE',
    direction,
  }),

  // a document failed to replicate (e.g. due to permissions)
  REPLICATION_EMITTED_DENIED: (direction: ReplicationDirection, err: PouchDB.Core.Error) => ({
    type: 'REPLICATION_EMITTED_DENIED' as 'REPLICATION_EMITTED_DENIED',
    direction,
    err,
  }),

  REPLICATION_EMITTED_COMPLETE: (
    direction: ReplicationDirection,
    info: PouchDB.Replication.ReplicationResultComplete<{}>,
  ) => ({
    type: 'REPLICATION_EMITTED_COMPLETE' as 'REPLICATION_EMITTED_COMPLETE',
    direction,
    info,
  }),

  REPLICATION_EMITTED_ERROR: (direction: ReplicationDirection, err: PouchDB.Core.Error) => ({
    type: 'REPLICATION_EMITTED_ERROR' as 'REPLICATION_EMITTED_ERROR',
    direction,
    err,
  }),
});
