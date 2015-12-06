import PouchDB from 'pouchdb';
import { timestamp, HOUR_IN_MS } from './helpers';

const db = new PouchDB(process.env.DB_URL, { skip_setup: true });

// Promises the single latest calibration doc
export function getLatestCalibration() {
    return db.allDocs({ // @see http://pouchdb.com/api.html#batch_fetch
        include_docs: true,
        descending: true,
        startkey: 'calibrations/_',
        endkey: 'calibrations/',
        limit: 1
    })
    .then(res => res.rows[0].doc);
}

// Promises entries from the last durationMs
function getLatestEntries(durationMs) {
    return db.allDocs({ // @see http://pouchdb.com/api.html#batch_fetch
        include_docs: true,
        startkey: 'sensor-entries/' + timestamp(Date.now() - durationMs),
        endkey: 'sensor-entries/' + timestamp()
    })
    .then(res => res.rows.map(row => row.doc));
}

// Promises treatments from the last durationMs
function getLatestTreatments(durationMs) {
    return db.allDocs({ // @see http://pouchdb.com/api.html#batch_fetch
        include_docs: true,
        startkey: 'treatments/' + timestamp(Date.now() - durationMs),
        endkey: 'treatments/' + timestamp()
    })
    .then(res => res.rows.map(row => row.doc));
}

// Promises two arrays, of most recent entries & treatments
export function getDataForAnalysis() {
    return Promise.all([
        getLatestEntries(HOUR_IN_MS * 0.5),
        getLatestTreatments(HOUR_IN_MS * 3)
    ]);
}

export function getActiveAlarms() {
    return Promise.resolve(); // TODO
}

export function createAlarm() {
    return Promise.resolve(); // TODO
}
