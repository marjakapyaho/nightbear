import PouchDB from 'pouchdb';
import { timestamp, HOUR_IN_MS } from './helpers';

// Promises the single latest calibration doc
export function getLatestCalibration({ pouchDB }) {
    return pouchDB.allDocs({ // @see http://pouchdb.com/api.html#batch_fetch
        include_docs: true,
        descending: true,
        startkey: 'calibrations/_',
        endkey: 'calibrations/',
        limit: 1
    })
    .then(res => res.rows[0].doc);
}

// Promises entries from the last durationMs
export function getLatestEntries({ pouchDB }, durationMs) {
    return pouchDB.allDocs({ // @see http://pouchdb.com/api.html#batch_fetch
        include_docs: true,
        startkey: 'sensor-entries/' + timestamp(Date.now() - durationMs),
        endkey: 'sensor-entries/' + timestamp()
    })
    .then(res => res.rows.map(row => row.doc));
}

// Promises treatments from the last durationMs
export function getLatestTreatments({ pouchDB }, durationMs) {
    return pouchDB.allDocs({ // @see http://pouchdb.com/api.html#batch_fetch
        include_docs: true,
        startkey: 'treatments/' + timestamp(Date.now() - durationMs),
        endkey: 'treatments/' + timestamp()
    })
    .then(res => res.rows.map(row => row.doc));
}

// Promises two arrays, of most recent entries & treatments
export function getDataForAnalysis(app) {
    return Promise.all([
        getLatestEntries(app, HOUR_IN_MS * 0.5),
        getLatestTreatments(app, HOUR_IN_MS * 3)
    ]);
}

export function getActiveAlarms({ pouchDB }) {
    // TODO HERE
    return pouchDB.allDocs({
            include_docs: true,
            startkey: 'alarms/' + timestamp(Date.now() - durationMs),
            endkey: 'alarms/' + timestamp()
        })
        .then(res => res.rows.map(row => row.doc));
}

export function createAlarm({ pouchDB }, type, level) {
    let newAlarm = {
        _id: 'alarms/' + timestamp(),
        type: type, // analyser status constants
        status: 'active',
        level: level,
        ack: false // Date.now()
    };

    return pouchDB.put(newAlarm).then(
        success => console.log('createAlarm()', newAlarm, '=>', success), // resolve with undefined
        failure => console.log('createAlarm()', newAlarm, '=> FAILURE:', failure) || Promise.reject(failure) // keep the Promise rejected
    );
}

export function updateAlarm({ pouchDB }) {
    return true;
}
