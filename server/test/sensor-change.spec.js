import ENTRIES from './sensor-change.json';
import createExpressServer from '../server';
import axios from 'axios';

describe('entries input and output', () => {

    let port;

    beforeEach(function(done) {
        const server = createExpressServer().listen(0, function() {
            port = server.address().port; // expose the OS-assigned random port for the rest of the test suite
            done();
        });
    });

    it('interprets sensor change correctly', () => {
        return axios.get('http://localhost:' + port + '/api/entries')
            .then(res => console.log('RES', res));
    });

});
