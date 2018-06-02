declare namespace PouchDB {
  namespace Core {
    interface ChangesOptions {
      return_docs: boolean; // https://pouchdb.com/api.html#changes
    }
  }
  namespace Replication {
    interface ReplicateOptions {
      checkpoint: 'source' | 'target' | false; // https://pouchdb.com/api.html#replication
    }
    interface ReplicationResult<Content extends {}> {
      pending?: number;
    }
  }
}
