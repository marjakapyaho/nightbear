import _ from 'lodash';
import PouchDB from 'pouchdb';
import * as helpers from './helpers';

const HOUR = 1000 * 60 * 60;
const DEFAULT_TREATMENT_TYPE = 'Meal Bolus'; // this is somewhat arbitrary, but "Meal Bolus" is the most applicable of the types available in Nightscout
const db = new PouchDB(process.env.DB_URL, { skip_setup: true });

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

export function getAlarms() {
    return Promise.resolve(data.getActiveAlarms());
}

export function ackAlarm() {
    return Promise.resolve(data.ackLatestAlarm());
}

export function getLegacyEntries({ data }, hours = 12) {
    return Promise.all([
        data.getLatestEntries(hours * HOUR),
        data.getLatestTreatments(hours * HOUR)
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

export function legacyPost({ pouchDB }, data) {
    console.log('legacyPost()', 'Incoming data:', data);
    return pouchDB.get('treatments/' + helpers.isoTimestamp(data.time))
        .catch(() => {
            console.log('legacyPost()', 'Existing treatment not found with time ' + data.time);
            return {
                eventType: DEFAULT_TREATMENT_TYPE,
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
