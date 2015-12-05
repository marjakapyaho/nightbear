import _ from 'lodash';
import PouchDB from 'pouchdb';
import { changeSGVUnit } from './analyser';

const HOUR = 1000 * 60 * 60;
const db = new PouchDB(process.env.DB_URL, { skip_setup: true });

// @example timestamp(1448805744000) => "2015-11-29T14:02:24Z"
function timestamp(timeInMs = Date.now()) {
    return new Date(timeInMs).toISOString().replace(/\..*/, 'Z');
}

// @example dbPUT('sensor-entries', { ... }) => Promise
function dbPUT(collection, data) {
    const object = _.extend({ _id: collection + '/' + timestamp(data.date) }, data);
    return db.put(object).then(
        success => console.log('dbPUT()', object, '=>', success), // resolve with undefined
        failure => console.log('dbPUT()', object, '=> FAILURE:', failure) || Promise.reject(failure) // keep the Promise rejected
    );
}

export function nightscoutUploaderPost(data) {
    const type = data.type;
    if (type === 'sgv') return dbPUT('sensor-entries', data);
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
        startkey: 'sensor-entries/' + timestamp(Date.now() - HOUR),
        endkey: 'sensor-entries/' + timestamp(),
        include_docs: true
    }).then(res => (
        res.rows.map(row => ({
            time: row.doc.date,
            sugar: changeSGVUnit(row.doc.sgv) + '' // "sugar" as in "blood sugar"
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
