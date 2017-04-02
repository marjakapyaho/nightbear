import PouchDB from 'pouchdb';
import createAppInstance from './app/';
import Logger from './utils/Logger';

let currentTime = Date.now(); // or e.g. Date.parse('2015-12-07')
const logger = new Logger(true);
const app = createAppInstance({
    logger,
    currentTime: () => currentTime,
    pouchDB: new PouchDB('TODO', { skip_setup: true }),
});

const log = logger('index');

log('App started');

next();

function next() {
    app.data.getHba1c().then(
        () => {
            currentTime -= 1000 * 60 * 60 * 24; // 1 day
            next();
        },
        err => log.error('ERROR', err)
    );
}


