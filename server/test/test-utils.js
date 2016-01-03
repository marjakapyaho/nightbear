import ENTRIES from './sensor-change.json';
import createAppInstance from '../app';
import axios from 'axios';
import PouchDB from 'pouchdb';
import MemDOWN from 'memdown';
import { assert } from 'chai';

export function serially(callbacks) {
    return callbacks.reduce((prev, next) => prev.then(next), Promise.resolve());
}

export function assertEqual(actual, expected) {
    return assert.deepEqual(actual, expected);
}

export function createTestApp() {
    let fakeCurrentTime = Date.now(); // any time-sensitive tests will likely want to change this
    const currentTime = () => fakeCurrentTime;
    const dbName = Date.now() + ''; // even though the in-memory DB's get dumped when the test suite exits, DB's with the same name will SHARE data during runtime
    const pouchDB = new PouchDB(dbName, { db: MemDOWN }); // http://pouchdb.com/adapters.html#pouchdb_in_node_js
    const app = createAppInstance(pouchDB, currentTime);
    let httpHostPrefix;
    app.__test = { // attach some helpful utilities for interacting with the test app we created
        createTestServer() {
            return new Promise(function(resolve) {
                const server = app.server.createExpressServer().listen(0, function() {
                    httpHostPrefix = 'http://localhost:' + server.address().port; // expose the OS-assigned random port for the rest of the test suite
                    resolve(httpHostPrefix);
                });
            });
        },
        setCurrentTime: newTime => fakeCurrentTime = newTime,
        get: url => axios.get(httpHostPrefix + url),
        post: (url, data) => axios.post(httpHostPrefix + url, data)
    };
    return app;
}
