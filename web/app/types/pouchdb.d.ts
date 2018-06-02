declare namespace PouchDB {
  namespace Replication {
    interface ReplicateOptions {
      checkpoint: 'source' | 'target' | false; // https://pouchdb.com/api.html#replication
    }
    interface ReplicationResult<Content extends {}> {
      pending?: number;
    }
  }
}
