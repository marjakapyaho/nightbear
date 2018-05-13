export type REPLICATION_DIRECTION = 'up' | 'down';

export type Action = Readonly<
  | { type: '@@INIT' } // note: the Redux API leaves this unspecified on purpose, but for exhaustiveness checks on type Action, let's include it
  | { type: 'DB_URL_SET'; newDbUrl: string }
  | {
      type: 'DB_EMITTED_CHANGE'; // something (anything) happened within the context of this replication
      direction: REPLICATION_DIRECTION;
      info: PouchDB.Replication.ReplicationResult<{}>;
    }
  | {
      type: 'DB_EMITTED_PAUSED'; // replication paused (e.g. replication up to date, user went offline)
      direction: REPLICATION_DIRECTION;
      err: PouchDB.Core.Error | undefined; // Error when e.g. offline, undefined when e.g. all caught up
    }
  | {
      type: 'DB_EMITTED_ACTIVE'; // replicate resumed (e.g. new changes replicating, user went back online)
      direction: REPLICATION_DIRECTION;
    }
  | {
      type: 'DB_EMITTED_DENIED'; // a document failed to replicate (e.g. due to permissions)
      direction: REPLICATION_DIRECTION;
      err: PouchDB.Core.Error;
    }
  | {
      type: 'DB_EMITTED_COMPLETE';
      direction: REPLICATION_DIRECTION;
      info: PouchDB.Replication.ReplicationResultComplete<{}>;
    }
  | {
      type: 'DB_EMITTED_ERROR';
      direction: REPLICATION_DIRECTION;
      err: PouchDB.Core.Error;
    }
>;
