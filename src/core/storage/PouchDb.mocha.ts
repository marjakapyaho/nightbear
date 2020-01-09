// Importantly, we want to make sure this adapter is never loaded outside of the test suite;
// we don't want it to sneak into production web bundles, especially.
console.log("Loading 'pouchdb-adapter-memory' for test suite");

import PouchDB from 'core/storage/PouchDb';

// tslint:disable-next-line:no-var-requires
const PouchDBMemory = require('pouchdb-adapter-memory');
PouchDB.plugin(PouchDBMemory); // @see https://www.npmjs.com/package/pouchdb-adapter-memory
