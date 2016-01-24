import PouchDB from 'pouchdb';
import Pushover from 'pushover-notifications';
import createAppInstance from './app';

const pushover = new Pushover( {
    user: process.env.PUSHOVER_USER,
    token: process.env.PUSHOVER_TOKEN
});

const pouchDB = new PouchDB(process.env.DB_URL, { skip_setup: true });
const app = createAppInstance(pouchDB, Date.now, pushover);

app.server.createExpressServer(3001, 'static');
app.alarms.initAlarms();
