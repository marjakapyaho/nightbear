// Instead of importing PouchDB directly, you should always import it via this file.
// This ensures that all the correct plugins are loaded before first use.

// @see https://github.com/pouchdb/pouchdb/issues/6692
import PouchDbImported from 'pouchdb';
// tslint:disable-next-line:no-var-requires
const PouchDB = PouchDbImported || require('pouchdb');

import * as PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBFind); // @see https://www.npmjs.com/package/pouchdb-find

export default PouchDB;
