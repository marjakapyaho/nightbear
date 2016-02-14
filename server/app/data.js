import * as helpers from './helpers';
import _ from 'lodash';

const END = '\uffff'; // http://pouchdb.com/api.html#prefix-search

export default app => {

    return {
        getTimelineContent,
        nightscoutUploaderPost,
        getActiveAlarms,
        createAlarm,
        updateAlarm,
        ackLatestAlarm,
        getStatus,
        createDeviceStatus,
        legacyPost,
        getLegacyEntries
    };

    // @example dbPUT('sensor-entries', { ... }) => Promise
    function dbPUT(collection, data) {
        const object = _.extend({}, data, { _id: collection + '/' + helpers.isoTimestamp(data.date) });
        return app.pouchDB.put(object).then(
            success => console.log('dbPUT()', object, '=>', success), // resolve with undefined
            failure => console.log('dbPUT()', object, '=> FAILURE:', failure) || Promise.reject(failure) // keep the Promise rejected
        );
    }

    function nightscoutUploaderPost(datum) {
        if (datum.type === 'sgv') {
            return getLatestCalibration()
                .then(cal => helpers.setActualGlucose(datum, cal))
                .then(data => dbPUT('sensor-entries', data));
        }
        else if (datum.type === 'mbg') {
            return dbPUT('meter-entries', datum);
        }
        else if (datum.type === 'cal') {
            return dbPUT('calibrations', datum);
        }
        else {
            return Promise.reject('Unknown data type');
        }
    }

    // Promises an object with a snapshot of the current timeline content (which can then be analysed, rendered etc)
    function getTimelineContent() {
        return Promise.all([
            getLatestEntries(helpers.HOUR_IN_MS * 0.5),
            getLatestTreatments(helpers.HOUR_IN_MS * 3),
            getLatestDeviceStatus()
        ]).then(([ latestEntries, latestTreatments, latestDeviceStatus ]) => ({
            latestEntries,
            latestTreatments,
            latestDeviceStatus
        }));
    }

    // Promises the single latest calibration doc
    function getLatestCalibration() {
        return app.pouchDB.allDocs({ // @see http://pouchdb.com/api.html#batch_fetch
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
        return app.pouchDB.allDocs({ // @see http://pouchdb.com/api.html#batch_fetch
            include_docs: true,
            startkey: 'sensor-entries/' + helpers.isoTimestamp(app.currentTime() - durationMs),
            endkey: 'sensor-entries/' + helpers.isoTimestamp(app.currentTime())
        })
        .then(res => res.rows.map(row => row.doc));
    }

    // Promises treatments from the last durationMs
    function getLatestTreatments(durationMs) {
        return app.pouchDB.allDocs({ // @see http://pouchdb.com/api.html#batch_fetch
            include_docs: true,
            startkey: 'treatments/' + helpers.isoTimestamp(app.currentTime() - durationMs),
            endkey: 'treatments/' + helpers.isoTimestamp(app.currentTime())
        })
        .then(res => res.rows.map(row => row.doc));
    }

    function getActiveAlarms(includeAcks = false) {
        return app.pouchDB.allDocs({
                include_docs: true,
                startkey: 'alarms/',
                endkey: 'alarms/' + END
            })
            .then(res => res.rows.map(row => row.doc))
            .then(docs => docs.filter(doc => ( // TODO: Move this filtering into a db.find(), this is wildly inefficient on larger datasets!
                (!doc.ack || doc.ack && includeAcks)
                &&
                doc.status === 'active'
            )));
    }

    function createAlarm(type, level) {
        let newAlarm = {
            _id: 'alarms/' + helpers.isoTimestamp(app.currentTime()),
            type: type, // analyser status constants
            status: 'active',
            level: level,
            ack: false // Date.now()
        };

        return app.pouchDB.put(newAlarm).then(
            success => console.log('createAlarm()', newAlarm, '=>', success), // resolve with undefined
            failure => console.log('createAlarm()', newAlarm, '=> FAILURE:', failure) || Promise.reject(failure) // keep the Promise rejected
        );
    }

    function updateAlarm(alarmDoc) {
        return app.pouchDB.put(alarmDoc);
    }

    function ackLatestAlarm() {
        return app.data.getActiveAlarms()
            .then(docs => docs[0])
            .then(function(doc) {
                if (!doc) return;
                doc.ack = app.currentTime();
                return app.data.updateAlarm(doc);
            });
    }

    function getStatus() {
        return Promise.all([
            getActiveAlarms(),
            getLatestDeviceStatus()
        ]).then(
            function([ alarms, deviceStatus ]) {
                return {
                    alarms: alarms,
                    deviceStatus: deviceStatus
                };
            },
            function(err) {
                console.log('Failed with error', err);
            }
        );
    }

    function createDeviceStatus(postData) {
        let deviceStatus = {
            _id: 'device-status/' + helpers.isoTimestamp(app.currentTime()),
            uploaderBattery: postData.uploaderBattery
        };

        return app.pouchDB.put(deviceStatus).then(
            success => console.log('createDeviceStatus()', deviceStatus, '=>', success),
            failure => console.log('createDeviceStatus()', deviceStatus, '=> FAILURE:', failure) || Promise.reject(failure)
        );
    }

    // Promises the single latest calibration doc
    function getLatestDeviceStatus() {
        return app.pouchDB.allDocs({
            include_docs: true,
            descending: true,
            startkey: 'device-status/_',
            endkey: 'device-status/',
            limit: 1
        })
        .then(res => res.rows[0] ? res.rows[0].doc : { uploaderBattery: null });
    }

    function legacyPost(data) {
        console.log('legacyPost()', 'Incoming data:', data);
        return app.pouchDB.get('treatments/' + helpers.isoTimestamp(data.time))
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
                return dbPUT('treatments', doc);
            });
    }

    function getLegacyEntries(hours = 12) {
        return Promise.all([
            getLatestEntries(hours * helpers.HOUR_IN_MS),
            getLatestTreatments(hours * helpers.HOUR_IN_MS)
        ]).then(([ entries, treatments ]) =>
            _(entries.concat(treatments))
                .groupBy(entry => entry.date)
                .map(group => _.merge.apply(_, group)) // if there's multiple entries/treatments with the same timestamp, merge them into one
                .map(entry => ({
                    time: entry.date,
                    carbs: entry.carbs,
                    insulin: entry.insulin,
                    sugar: entry.nb_glucose_value && entry.nb_glucose_value.toFixed(1) + '', // "sugar" as in "blood sugar"; send as string
                    is_raw: entry.nb_glucose_value && entry.noise >= helpers.NOISE_LEVEL_LIMIT
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

};
