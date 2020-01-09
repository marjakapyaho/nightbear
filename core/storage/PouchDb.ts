// Instead of importing PouchDB directly, you should always import it via this file.
// This ensures that all the correct plugins are loaded before first use.

// This file also supports loading via default imports and not.
// @see https://github.com/pouchdb/pouchdb/issues/6692

import * as _PouchDB from 'pouchdb';
import __PouchDB from 'pouchdb';
const PouchDB: typeof __PouchDB = (_PouchDB as any).default || _PouchDB;

import * as PouchDBFind from 'pouchdb-find';
PouchDB.plugin((PouchDBFind as any).default || PouchDBFind); // @see https://www.npmjs.com/package/pouchdb-find

export default PouchDB;
