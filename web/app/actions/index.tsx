import { ReplicationDirection } from 'nightbear/web/app/reducers';

export type Action = Readonly<
  | { type: 'DB_URL_SET'; newDbUrl: string }
  | {
      type: 'DB_EMITTED_READY';
    }
  | {
      type: 'DB_EMITTED_CHANGE';
      change: PouchDB.Core.ChangesResponseChange<{}>;
    }
  | {
      type: 'DB_EMITTED_COMPLETE';
      info: PouchDB.Core.ChangesResponse<{}>;
    }
  | {
      type: 'DB_EMITTED_ERROR';
      err: PouchDB.Core.Error;
    }
  | {
      type: 'REPLICATION_EMITTED_CHANGE'; // something (anything) happened within the context of this replication
      direction: ReplicationDirection;
      info: PouchDB.Replication.ReplicationResult<{}>;
    }
  | {
      type: 'REPLICATION_EMITTED_PAUSED'; // replication paused (e.g. replication up to date, user went offline)
      direction: ReplicationDirection;
      err: PouchDB.Core.Error | undefined; // Error when e.g. offline, undefined when e.g. all caught up
    }
  | {
      type: 'REPLICATION_EMITTED_ACTIVE'; // replicate resumed (e.g. new changes replicating, user went back online)
      direction: ReplicationDirection;
    }
  | {
      type: 'REPLICATION_EMITTED_DENIED'; // a document failed to replicate (e.g. due to permissions)
      direction: ReplicationDirection;
      err: PouchDB.Core.Error;
    }
  | {
      type: 'REPLICATION_EMITTED_COMPLETE';
      direction: ReplicationDirection;
      info: PouchDB.Replication.ReplicationResultComplete<{}>;
    }
  | {
      type: 'REPLICATION_EMITTED_ERROR';
      direction: ReplicationDirection;
      err: PouchDB.Core.Error;
    }
  | {
      type: 'TIMELINE_DATA_REQUESTED';
      timeRange: number;
    }
>;
