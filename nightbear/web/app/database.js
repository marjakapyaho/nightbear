import { fromJS, Map } from 'immutable';

export default {

  initialState: { // NOTE: will pass through Immutable.fromJS() before first use
    doingInitialFetch: false,
    databaseFailures: {},
    docMap: {},
  },

  actionCreators: {

    startDatabaseConnection(app) {
      app.actions.database.initialFetchStarted();
      app.utils.pouchDB.allDocs({
        include_docs: true,
        conflicts: true,
      }).then(res => new Map(res.rows.map(row => [ row.id, fromJS(row.doc) ])))
        .then(docMap => fetchConflictingRevs(app, docMap))
        .then(app.actions.database.documentsReceived)
        .catch(app.actions.database.databaseFailed);
      app.utils.pouchDB.changes({
        since: 'now',
        live: true,
        retry: true,
        include_docs: true,
        conflicts: true,
      }).on('change', change => {
        const docMap = fromJS({ [change.id]: change.doc });
        fetchConflictingRevs(app, docMap);
        app.actions.database.documentsReceived(docMap);
      }).on('error', app.actions.database.databaseFailed);
    },

  },

  localReducers: {

    database: {

      initialFetchStarted(state) {
        return state.set('doingInitialFetch', true);
      },

      documentsReceived(state) {
        return state.set('doingInitialFetch', false);
      },

      conflictReceived(state, conflictingDoc) {
        return state.updateIn([ 'docMap', conflictingDoc.get('_id'), '_conflicts' ], conflictList => (
          conflictList.map(conflictRev => (
            conflictRev === conflictingDoc.get('_rev') ? conflictingDoc : conflictRev)
          )
        ));
      },

      databaseFailed(state, err) {
        return state
          .update('databaseFailures', list => list.push(err.message))
          .set('doingInitialFetch', false);
      },

    },

  },

};

function fetchConflictingRevs(app, docMap) {
  docMap
    .filter(doc => doc.get('_conflicts') && doc.get('_conflicts').size)
    .forEach(doc => {
      doc.get('_conflicts').forEach(conflictingRev => {
        app.utils.pouchDB.get(doc.get('_id'), { rev: conflictingRev })
          .then(fromJS)
          .then(app.actions.database.conflictReceived)
          .catch(app.actions.database.databaseFailed);
      });
    });
  return docMap; // for convenience, return the original docMap
}
