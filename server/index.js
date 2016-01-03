import createAppInstance from './app';

// TODO: Remove this conditional once we've settled on a UI hosting solution
const STATIC_ASSETS_PATH = process.env.NODE_ENV === 'production' ? '/legacy-client-dist' : null;

const pouchDB = new PouchDB(process.env.DB_URL, { skip_setup: true });

const app = createAppInstance(pouchDB, Date.now);

const server = app.server.createExpressServer(STATIC_ASSETS_PATH).listen(3001, function() {
    console.log('nightbear server listening on port %s', server.address().port);
    app.alarms.initAlarms();
});
