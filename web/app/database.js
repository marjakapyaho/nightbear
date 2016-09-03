import { fromJS, Map } from 'immutable';

export default {

  initialState: { // NOTE: will pass through Immutable.fromJS() before first use
    databaseWorking: false,
    databaseFailures: [],
    currentSettings: null,
  },

  actionCreators: {

    startDatabaseConnection(app) {
      app.actions.database.databaseWorkStarted();
      app.utils.pouchDB.allDocs({
          include_docs: true,
          descending: true,
          startkey: 'settings/_',
          endkey: 'settings/',
          limit: 1,
        })
        .then(res => res.rows[0] ? res.rows[0].doc : null)
        .then(fromJS)
        .then(app.actions.database.settingsReceived)
        .catch(app.actions.database.databaseFailed);
    },

    updateSettings(app, newSettings) {
      app.actions.database.databaseWorkStarted();
      const newDoc = newSettings
        .set('_id', 'settings/' + isoTimestamp(app.utils.getCurrentTime()))
        .delete('_rev')
      app.utils.pouchDB.put(newDoc.toJS())
        .then(() => newDoc)
        .then(app.actions.database.settingsReceived)
        .catch(app.actions.database.databaseFailed);
    },

  },

  localReducers: {

    database: {

      databaseWorkStarted(state) {
        return state.set('databaseWorking', true);
      },

      settingsReceived(state, settingsDoc) {
        return state
          .set('currentSettings', settingsDoc)
          .set('databaseWorking', false);
      },

      databaseFailed(state, err) {
        return state
          .update('databaseFailures', list => list.push(err.message))
          .set('databaseWorking', false);
      },

    },

  },

};

// @example isoTimestamp(1448805744000) => "2015-11-29T14:02:24Z"
function isoTimestamp(timeInMs) {
  return new Date(timeInMs).toISOString().replace(/\..*/, 'Z');
}
