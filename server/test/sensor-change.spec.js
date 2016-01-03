import ENTRIES from './sensor-change.json';
import createAppInstance from '../app';
import axios from 'axios';
import PouchDB from 'pouchdb';
import MemDOWN from 'memdown';
import { assert } from 'chai';

describe('entries input and output', () => {

    let app, port;

    const currentTime = () => 1451472024000 + 1000; // 1 sec after the last entry in ENTRIES

    beforeEach(function(done) {
        const pouchDB = new PouchDB('test', { db: MemDOWN }); // http://pouchdb.com/adapters.html#pouchdb_in_node_js
        app = createAppInstance(pouchDB, currentTime);
        const server = app.server.createExpressServer().listen(0, function() {
            port = server.address().port; // expose the OS-assigned random port for the rest of the test suite
            done();
        });
    });

    const get = url => axios.get('http://localhost:' + port + url);
    const post = (url, data) => axios.post('http://localhost:' + port + url, data);
    const serially = callbacks => callbacks.reduce((prev, next) => prev.then(next), Promise.resolve());

    it('interprets sensor change correctly', () => {
        return serially(ENTRIES.map(data => () => post('/api/v1/entries', data)))
            .then(() => get('/api/entries'))
            .then(res => assert.deepEqual(
                res.data,
                [
                    { time: 1451470224000, sugar: '7.6', is_raw: false },
                    { time: 1451470524000, sugar: '7.7', is_raw: false },
                    { time: 1451470824000, sugar: '7.9', is_raw: false },
                    { time: 1451471424000, sugar: '8.4', is_raw: true },
                    { time: 1451471724000, sugar: '8.6', is_raw: true },
                    { time: 1451472024000, sugar: '8.9', is_raw: true }
                ]
            ));
    });

});
