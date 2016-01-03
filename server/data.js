import PouchDB from 'pouchdb';
import * as helpers from './helpers';
import _ from 'lodash';

// @example dbPUT('sensor-entries', { ... }) => Promise
function dbPUT(pouchDB, collection, data) {
    const object = _.extend({ _id: collection + '/' + helpers.isoTimestamp(data.date) }, data);
    return pouchDB.put(object).then(
        success => console.log('dbPUT()', object, '=>', success), // resolve with undefined
        failure => console.log('dbPUT()', object, '=> FAILURE:', failure) || Promise.reject(failure) // keep the Promise rejected
    );
}

export function nightscoutUploaderPost({ pouchDB, data }, datum) {
    if (datum.type === 'sgv') {
        return data.getLatestCalibration()
            .then(cal => helpers.setActualGlucose(datum, cal))
            .then(data => dbPUT(pouchDB, 'sensor-entries', data));
    }
    else if (datum.type === 'mbg') {
        return dbPUT(pouchDB, 'meter-entries', datum);
    }
    else if (datum.type === 'cal') {
        return dbPUT(pouchDB, 'calibrations', datum);
    }
    else {
        return Promise.reject('Unknown data type');
    }
}

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
        startkey: 'sensor-entries/' + helpers.isoTimestamp(currentTime() - durationMs),
        endkey: 'sensor-entries/' + helpers.isoTimestamp(currentTime())
    })
    .then(res => res.rows.map(row => row.doc));
}

// Promises treatments from the last durationMs
export function getLatestTreatments({ pouchDB, currentTime }, durationMs) {
    return pouchDB.allDocs({ // @see http://pouchdb.com/api.html#batch_fetch
        include_docs: true,
        startkey: 'treatments/' + helpers.isoTimestamp(currentTime() - durationMs),
        endkey: 'treatments/' + helpers.isoTimestamp(currentTime())
    })
    .then(res => res.rows.map(row => row.doc));
}

const END = '\uffff'; // http://pouchdb.com/api.html#prefix-search

export function getActiveAlarms({ pouchDB }, includeAcks) {
    // includeAcks --> if true include those with ack = TIMESTAMP
    return pouchDB.allDocs({
            include_docs: true,
            startkey: 'alarms/',
            endkey: 'alarms/' + END
        })
        .then(res => res.rows.map(row => row.doc));
}

export function createAlarm({ pouchDB, currentTime }, type, level) {
    let newAlarm = {
        _id: 'alarms/' + helpers.isoTimestamp(currentTime()),
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

export function updateAlarm({ pouchDB }, alarmData) {

    // Upsert alarm with given alarm data

    return true;
}

export function ackLatestAlarm({ pouchDB }) {

    // Ack latest alarm in DB

    return true;
}

export function legacyPost({ pouchDB }, data) {
    console.log('legacyPost()', 'Incoming data:', data);
    return pouchDB.get('treatments/' + helpers.isoTimestamp(data.time))
        .catch(() => {
            console.log('legacyPost()', 'Existing treatment not found with time ' + data.time);
            return {
                eventType: helpers.DEFAULT_TREATMENT_TYPE,
                created_at: new Date(data.time).toISOString(),
                date: data.time, // NOTE: This is a NON-STANDARD field, only used by Nightbear
                enteredBy: 'Nightbear Web UI'
            };
        })
        .then(doc => {
            if (data.insulin) doc.insulin = data.insulin; else delete doc.insulin;
            if (data.carbs) doc.carbs = data.carbs; else delete doc.carbs;
            // TODO: if (data.sugar)..?
            return dbPUT(pouchDB, 'treatments', doc);
        });
}

export function getLegacyEntries({ data }, hours = 12) {
    return Promise.all([
        data.getLatestEntries(hours * helpers.HOUR_IN_MS),
        data.getLatestTreatments(hours * helpers.HOUR_IN_MS)
    ]).then(([ entries, treatments ]) =>
        _(entries.concat(treatments))
            .groupBy(entry => entry.date)
            .map(group => _.merge.apply(_, group)) // if there's multiple entries/treatments with the same timestamp, merge them into one
            .map(entry => ({
                time: entry.date,
                carbs: entry.carbs,
                insulin: entry.insulin,
                sugar: entry.nb_glucose_value && entry.nb_glucose_value.toFixed(1) + '', // "sugar" as in "blood sugar"; send as string
                is_raw: entry.nb_glucose_value && entry.direction === helpers.DIRECTION_NOT_COMPUTABLE
            }))
            .sortBy(entry => entry.time) // return in chronological order
            .value()
    ).then(
        data => {
            console.log('getLegacyEntries()', 'Returning:', data.length);
            return data;
        },
        err => {
            console.log('getLegacyEntries()', 'Failed:', err);
            return Promise.reject(err);
        }
    );
}
