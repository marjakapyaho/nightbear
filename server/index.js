import * as alarms from './alarms';
import createExpressServer from './server';

const STATIC_ASSETS_PATH = process.env.NODE_ENV === 'production' ? '/legacy-client-dist' : null; // TODO: Remove this conditional once we've settled on a UI hosting solution

// TODO: const db = new PouchDB(process.env.DB_URL, { skip_setup: true });

const server = createExpressServer(STATIC_ASSETS_PATH).listen(3001, function() {
    console.log('nightbear server listening on port %s', server.address().port);
    alarms.initAlarms();
});
