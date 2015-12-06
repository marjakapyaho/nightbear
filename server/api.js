import _ from 'lodash';
import PouchDB from 'pouchdb';
import * as helpers from './helpers';
import { getLatestCalibration } from './data';

const HOUR = 1000 * 60 * 60;
const DEFAULT_TREATMENT_TYPE = 'Meal Bolus'; // this is somewhat arbitrary, but "Meal Bolus" is the most applicable of the types available in Nightscout
const db = new PouchDB(process.env.DB_URL, { skip_setup: true });

// @example dbPUT('sensor-entries', { ... }) => Promise
function dbPUT(collection, data) {
    const object = _.extend({ _id: collection + '/' + helpers.timestamp(data.date) }, data);
    return db.put(object).then(
        success => console.log('dbPUT()', object, '=>', success), // resolve with undefined
        failure => console.log('dbPUT()', object, '=> FAILURE:', failure) || Promise.reject(failure) // keep the Promise rejected
    );
}

export function nightscoutUploaderPost(data) {
    if (data.type === 'sgv') {
        return getLatestCalibration()
            .then(cal => helpers.setActualGlucose(data, cal))
            .then(data => dbPUT('sensor-entries', data));
    }
    else if (data.type === 'mbg') {
        return dbPUT('meter-entries', data);
    }
    else if (data.type === 'cal') {
        return dbPUT('calibrations', data);
    }
    else {
        return Promise.reject('Unknown data type');
    }
}

export function ackAlarm(data) {
    // Find alarm with id in db and
    // Set ack timestamp
    var timestamp = Date.now();
    return Promise.resolve();
}

export function getAlarms() {
    var activeAlarms = data.getActiveAlarms();
    return Promise.resolve(activeAlarms);
}

export function getLegacyEntries() {
    return db.allDocs({
        startkey: 'sensor-entries/' + helpers.timestamp(Date.now() - HOUR),
        endkey: 'sensor-entries/' + helpers.timestamp(),
        include_docs: true
    }).then(res => (
        res.rows.map(row => ({
            time: row.doc.date,
            sugar: helpers.changeSGVUnit(row.doc.sgv).toFixed(1) + '' // "sugar" as in "blood sugar"; send as string
        }))
    ));
}

export function legacyPost(data) {
    console.log('legacyPost()', 'Incoming data:', data);
    return db.get('treatments/' + helpers.timestamp(data.time))
        .catch(() => {
            console.log('legacyPost()', 'Existing treatment not found with time ' + data.time);
            const timestamp = new Date();
            return {
                eventType: DEFAULT_TREATMENT_TYPE,
                created_at: timestamp.toISOString(),
                date: timestamp.getTime(), // NOTE: This is a NON-STANDARD field, only used by Nightbear
                enteredBy: 'Nightbear Web UI'
            };
        })
        .then(doc => {
            if (data.insulin) doc.insulin = data.insulin; else delete doc.insulin;
            if (data.carbs) doc.carbs = data.carbs; else delete doc.carbs;
            // TODO: if (data.sugar)..?
            return dbPUT('treatments', doc);
        });
}
