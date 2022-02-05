declare namespace PouchDB {
  namespace Replication {
    interface ReplicateOptions {
      checkpoint: 'source' | 'target' | false; // https://pouchdb.com/api.html#replication
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ReplicationResult<Content extends {}> {
      pending?: number;
    }
  }
}
