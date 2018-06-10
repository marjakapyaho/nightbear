import { ReplicationDirection } from 'web/app/modules/pouchDb/state';

export function DB_EMITTED_READY() {
  return {
    type: 'DB_EMITTED_READY' as 'DB_EMITTED_READY',
  };
}

export function DB_EMITTED_CHANGE(change: PouchDB.Core.ChangesResponseChange<{}>) {
  return {
    type: 'DB_EMITTED_CHANGE' as 'DB_EMITTED_CHANGE',
    change,
  };
}

export function DB_EMITTED_COMPLETE(info: PouchDB.Core.ChangesResponse<{}>) {
  return {
    type: 'DB_EMITTED_COMPLETE' as 'DB_EMITTED_COMPLETE',
    info,
  };
}

export function DB_EMITTED_ERROR(err: PouchDB.Core.Error) {
  return {
    type: 'DB_EMITTED_ERROR' as 'DB_EMITTED_ERROR',
    err,
  };
}

// something (anything) happened within the context of this replication
export function REPLICATION_EMITTED_CHANGE(
  direction: ReplicationDirection,
  info: PouchDB.Replication.ReplicationResult<{}>,
) {
  return {
    type: 'REPLICATION_EMITTED_CHANGE' as 'REPLICATION_EMITTED_CHANGE',
    direction,
    info,
  };
}

// replication paused (e.g. replication up to date, user went offline)
export function REPLICATION_EMITTED_PAUSED(
  direction: ReplicationDirection,
  err: PouchDB.Core.Error | undefined, // Error when e.g. offline, undefined when e.g. all caught up
) {
  return {
    type: 'REPLICATION_EMITTED_PAUSED' as 'REPLICATION_EMITTED_PAUSED',
    direction,
    err,
  };
}

// replicate resumed (e.g. new changes replicating, user went back online)
export function REPLICATION_EMITTED_ACTIVE(direction: ReplicationDirection) {
  return {
    type: 'REPLICATION_EMITTED_ACTIVE' as 'REPLICATION_EMITTED_ACTIVE',
    direction,
  };
}

// a document failed to replicate (e.g. due to permissions)
export function REPLICATION_EMITTED_DENIED(
  direction: ReplicationDirection,
  err: PouchDB.Core.Error,
) {
  return {
    type: 'REPLICATION_EMITTED_DENIED' as 'REPLICATION_EMITTED_DENIED',
    direction,
    err,
  };
}

export function REPLICATION_EMITTED_COMPLETE(
  direction: ReplicationDirection,
  info: PouchDB.Replication.ReplicationResultComplete<{}>,
) {
  return {
    type: 'REPLICATION_EMITTED_COMPLETE' as 'REPLICATION_EMITTED_COMPLETE',
    direction,
    info,
  };
}

export function REPLICATION_EMITTED_ERROR(
  direction: ReplicationDirection,
  err: PouchDB.Core.Error,
) {
  return {
    type: 'REPLICATION_EMITTED_ERROR' as 'REPLICATION_EMITTED_ERROR',
    direction,
    err,
  };
}

export type PouchDbAction =
  | Readonly<ReturnType<typeof DB_EMITTED_READY>>
  | Readonly<ReturnType<typeof DB_EMITTED_CHANGE>>
  | Readonly<ReturnType<typeof DB_EMITTED_COMPLETE>>
  | Readonly<ReturnType<typeof DB_EMITTED_ERROR>>
  | Readonly<ReturnType<typeof REPLICATION_EMITTED_CHANGE>>
  | Readonly<ReturnType<typeof REPLICATION_EMITTED_PAUSED>>
  | Readonly<ReturnType<typeof REPLICATION_EMITTED_ACTIVE>>
  | Readonly<ReturnType<typeof REPLICATION_EMITTED_DENIED>>
  | Readonly<ReturnType<typeof REPLICATION_EMITTED_COMPLETE>>
  | Readonly<ReturnType<typeof REPLICATION_EMITTED_ERROR>>;
