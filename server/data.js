import PouchDB from 'pouchdb';
import { isoTimestamp, HOUR_IN_MS } from './helpers';

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
export function getLatestEntries({ pouchDB, currentTime }, durationMs) {
    return pouchDB.allDocs({ // @see http://pouchdb.com/api.html#batch_fetch
        include_docs: true,
        startkey: 'sensor-entries/' + isoTimestamp(currentTime() - durationMs),
        endkey: 'sensor-entries/' + isoTimestamp(currentTime())
    })
    .then(res => res.rows.map(row => row.doc));
}

// Promises treatments from the last durationMs
export function getLatestTreatments({ pouchDB, currentTime }, durationMs) {
    return pouchDB.allDocs({ // @see http://pouchdb.com/api.html#batch_fetch
        include_docs: true,
        startkey: 'treatments/' + isoTimestamp(currentTime() - durationMs),
        endkey: 'treatments/' + isoTimestamp(currentTime())
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

export function getActiveAlarms({ pouchDB, currentTime }) {
    // TODO HERE
    return pouchDB.allDocs({
            include_docs: true,
            startkey: 'alarms/' + isoTimestamp(currentTime() - durationMs),
            endkey: 'alarms/' + isoTimestamp(currentTime())
        })
        .then(res => res.rows.map(row => row.doc));
}

export function createAlarm({ pouchDB, currentTime }, type, level) {
    let newAlarm = {
        _id: 'alarms/' + isoTimestamp(currentTime()),
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
