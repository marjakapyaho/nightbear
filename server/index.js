import PouchDB from 'pouchdb';
import Pushover from 'pushover-notifications';
import createAppInstance from './app/';
import MemDOWN from 'memdown';
import Logger from './utils/Logger';

const app = createAppInstance({
    logger: new Logger(true, process.env.PAPERTRAIL_URL),
    currentTime: Date.now,
    pouchDB: process.env.DB_URL
        ? new PouchDB(process.env.DB_URL, { skip_setup: true }) // connect to actual DB
        : new PouchDB('local-dev-db', { db: MemDOWN }), // use a throw-away in-memory DB
    pushover: new Pushover({
        user: process.env.PUSHOVER_USER,
        token: process.env.PUSHOVER_TOKEN
    })
});

app.server.createExpressServer(3001, 'static');
app.alarms.initAlarms();
