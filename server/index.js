import PouchDB from 'pouchdb';
import Pushover from 'pushover-notifications';
import createAppInstance from './app/';

const app = createAppInstance({
    currentTime: Date.now,
    pouchDB: new PouchDB(process.env.DB_URL, { skip_setup: true }),
    pushover: new Pushover({
        user: process.env.PUSHOVER_USER,
        token: process.env.PUSHOVER_TOKEN
    })
});

app.server.createExpressServer(3001, 'static');
app.alarms.initAlarms();
