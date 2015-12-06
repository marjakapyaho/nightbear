import _ from 'lodash';
import PouchDB from 'pouchdb';
import * as helpers from './helpers';

const HOUR = 1000 * 60 * 60;
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
    const type = data.type;
    if (type === 'sgv') return dbPUT('sensor-entries', helpers.detectActualGlucose(data));
    else if (type === 'mbg') return dbPUT('meter-entries', data);
    else if (type === 'cal') return dbPUT('calibrations', data);
    return Promise.reject('Unknown data type');
}

export function setStatus(data) {

    // Set status to ack = true

    return Promise.resolve();
}

export function getStatus() {
    return Promise.resolve({
        'status': 'outdated',
        'ack': true
    });
}

export function getLegacyEntries() {
    return db.allDocs({
        startkey: 'sensor-entries/' + helpers.timestamp(Date.now() - HOUR),
        endkey: 'sensor-entries/' + helpers.timestamp(),
        include_docs: true
    }).then(res => (
        res.rows.map(row => ({
            time: row.doc.date,
            sugar: helpers.changeSGVUnit(row.doc.sgv) + '' // "sugar" = "blood sugar"
        }))
    ));
}

export function legacyPost(data) {

    let entry = {
        "eventType": "Note",
        "created_at": new Date().toISOString()
    };

    if (data.insulin) { entry.insulin = data.insulin; }
    if (data.carbs) { entry.carbs = data.carbs; }

    // Save data to treatments

    return Promise.resolve();
}
