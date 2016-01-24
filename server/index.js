import PouchDB from 'pouchdb';
import Pushover from 'pushover-notifications';
import createAppInstance from './app';

const pushover = new Pushover( {
    user: process.env.PUSHOVER_USER,
    token: process.env.PUSHOVER_TOKEN
});

// TODO: Remove this conditional once we've settled on a UI hosting solution
const STATIC_ASSETS_PATH = process.env.NODE_ENV === 'production' ? '/legacy-client-dist' : 'static';

const pouchDB = new PouchDB(process.env.DB_URL, { skip_setup: true });
const app = createAppInstance(pouchDB, Date.now, pushover);

app.server.createExpressServer(3001, STATIC_ASSETS_PATH);
app.alarms.initAlarms();
