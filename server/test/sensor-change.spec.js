import ENTRIES from './sensor-change.json';
import createAppInstance from '../app';
import axios from 'axios';
import PouchDB from 'pouchdb';
import MemDOWN from 'memdown';

describe('entries input and output', () => {

    let app, port;

    beforeEach(function(done) {
        const pouchDB = new PouchDB('test', { db: MemDOWN }); // http://pouchdb.com/adapters.html#pouchdb_in_node_js
        app = createAppInstance(pouchDB);
        const server = app.server.createExpressServer().listen(0, function() {
            port = server.address().port; // expose the OS-assigned random port for the rest of the test suite
            done();
        });
    });

    it('interprets sensor change correctly', () => {
        return axios.get('http://localhost:' + port + '/api/entries')
            .then(res => console.log('RES', res));
    });

});
