import PouchDB from 'pouchdb';
import createAppInstance from './app/';
import MemDOWN from 'memdown';
import Logger from './utils/Logger';
import NightscoutProxy from './utils/NightscoutProxy';
import ParakeetProxy from './utils/ParakeetProxy';
import PushoverClient from './utils/PushoverClient';

const logger = new Logger(true, process.env.PAPERTRAIL_URL);
const app = createAppInstance({
    logger,
    currentTime: Date.now,
    pouchDB: process.env.DB_URL
        ? new PouchDB(process.env.DB_URL, { skip_setup: true }) // connect to actual DB
        : new PouchDB('local-dev-db', { db: MemDOWN }), // use a throw-away in-memory DB
    pushover: process.env.PUSHOVER_USER && new PushoverClient(logger, process.env.PUSHOVER_USER, process.env.PUSHOVER_TOKEN),
    nightscoutProxy: process.env.NS_PROXY_URLS && new NightscoutProxy(process.env.NS_PROXY_URLS.split(' '), process.env.NS_PROXY_SECRET),
    parakeetProxy: process.env.PARAKEET_PROXY_URL && new ParakeetProxy(logger, process.env.PARAKEET_PROXY_URL),
});

app.queryThrottleMs = parseInt(process.env.QUERY_THROTTLE_MS) || 0;

app.server.createExpressServer(3001, 'static');
app.alarms.runChecks(app.queryThrottleMs || 0);

setInterval(app.data.getHba1c, 1000 * 60 * 60 * 6); // calculate & cache a new HBA1C every 6 hours (though a new one will be created only once per 24h)
app.data.getHba1c(); // ...and immediately during startup
