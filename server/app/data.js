import * as helpers from './helpers';
import * as alarms from './alarms';
import _ from 'lodash';

const END = '\uffff'; // http://pouchdb.com/api.html#prefix-search

export default app => {

    const log = app.logger(__filename);

    return {
        getTimelineContent,
        nightscoutUploaderPost,
        getActiveAlarms,
        createAlarm,
        updateAlarm,
        ackLatestAlarm,
        getStatus,
        createDeviceStatus,
        saveTestData,
        legacyPost,
        getLegacyEntries,
        getProfileSettings
    };

    // @example dbPUT('sensor-entries', { ... }) => Promise
    function dbPUT(collection, data, dateOverride = null) { // TODO: Switch args order to make collection optional!
        const _id = data._id || collection + '/' + helpers.isoTimestamp(dateOverride || data.date); // use existing ID if provided
        const object = _.extend({}, data, { _id });
        return app.pouchDB.put(object).then(
            success => log.debug('dbPUT()', object, '=>', success), // resolve with undefined
            failure => log.debug('dbPUT()', object, '=> FAILURE', failure) || Promise.reject(failure) // keep the Promise rejected; we don't log this on the "error" level because sometimes a PUT is expected to fail (e.g. duplicate keys)
        );
    }

    function nightscoutUploaderPost(datum) {

        if (app.nightscoutProxy) { // only proxy incoming data if a downstream Nightscout server has been configured
            app.nightscoutProxy.sendEntry(datum).then(
                success => log.debug(`Successfully sent entry (${datum.type}) downstream`),
                failure => log.error('Failed to send entry downstream', failure)
            );
        }

        if (datum.type === 'sgv') {
            return getLatestCalibration()
                .then(cal => helpers.setActualGlucose(datum, cal))
                .then(data => dbPUT('sensor-entries', data))
                .then(() => log(`Received entry (${datum.type})`))
                .then(() => app.alarms.runChecks()) // No need to wait for results
                .then(() => [ datum ]); // reply as the Nightscout API would
        }
        else if (datum.type === 'mbg') {
            return dbPUT('meter-entries', datum)
                .catch(err => {
                    if (err.name !== 'conflict') throw err; // conflict is actually often expected, as the Nightscout Uploader will keep sending the same entries over and over
                })
                .then(() => log(`Received entry (${datum.type})`))
                .then(() => [ datum ]); // reply as the Nightscout API would
        }
        else if (datum.type === 'cal') {
            return dbPUT('calibrations', datum)
                .catch(err => {
                    if (err.name !== 'conflict') throw err; // same as with "meter-entries"
                })
                .then(() => log(`Received entry (${datum.type})`))
                .then(() => [ datum ]); // reply as the Nightscout API would
        }
        else {
            log.error(`Received unknown entry`, datum);
            return Promise.reject('Unknown data type');
        }
    }

    // Promises an object with a snapshot of the current timeline content
    // (which can then be analysed, rendered etc)
    function getTimelineContent() {
        return Promise.all([
            getLatestEntries(helpers.HOUR_IN_MS * 2.5),
            getLatestTreatments(helpers.HOUR_IN_MS * 3.5),
            getLatestDeviceStatus(),
            getActiveAlarms(true), // include acknowledged alarms
            getLatestCalibration(),
            getProfileSettings()
        ]).then(([ latestEntries, latestTreatments, latestDeviceStatus, activeAlarms, latestCal, profileSettings ]) => ({
            latestEntries,
            latestTreatments,
            latestDeviceStatus,
            activeAlarms,
            latestCal,
            profileSettings
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
        .then(res => res.rows[0] ? res.rows[0].doc : {});
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

    function getActiveAlarms(includeInvalids = false) {
        return app.pouchDB.allDocs({
                include_docs: true,
                startkey: 'alarms/',
                endkey: 'alarms/' + END
            })
            .then(res => res.rows.map(row => row.doc))
            .then(docs => docs.filter(doc => ( // TODO: Move this filtering into a db.find(), this is wildly inefficient on larger datasets!
                doc.status === 'active'
                &&
                (includeInvalids || !includeInvalids && app.currentTime() >= doc.validAfter)
            )));
    }

    function createAlarm(type, level) {
        let newAlarm = {
            type: type, // analyser status constants
            status: 'active',
            level: level,
            validAfter: app.currentTime()
        };
        return dbPUT('alarms', newAlarm, app.currentTime()).then(
            () => log(`Created alarm (${type} on level ${level})`),
            err => log.error('Could not create alarm') || Promise.reject(err) // keep the Promise rejected
        );
    }

    function updateAlarm(alarmDoc) {
        return dbPUT(null, alarmDoc).then(
            () => log(`Updated alarm (${alarmDoc.type} on level ${alarmDoc.level})`),
            err => log.error('Could not update alarm') || Promise.reject(err) // keep the Promise rejected
        );
    }

    function ackLatestAlarm() {
        return Promise.all([
            app.data.getActiveAlarms(),
            app.data.getProfileSettings()
        ]).then(
            function([ docs, profileSettings ]) {
                const alarm = docs[0];
                if (!alarm) {
                    log.debug('Acking latest alarm, but no active alarms');
                    return {};
                }

                const snoozeTime = app.profile.getActiveProfile(profileSettings).alarmSettings[alarm.type].snooze;
                if (!snoozeTime) throw new Error('Invalid alarm type');

                log(`Acking latest alarm (${alarm.type} on level ${alarm.level}) for ${snoozeTime} minutes`);

                alarm.validAfter = app.currentTime() + snoozeTime * helpers.MIN_IN_MS;
                alarm.level = 1; // reset level

                return app.pushover.ackAlarms(alarm.pushoverReceipts)
                    .then(() => {
                        alarm.pushoverReceipts = [];
                        return app.data.updateAlarm(alarm);
                    })
                    .then(() => {}); // reply with empty JSON object
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
                log.error('Could not get status', err);
            }
        );
    }

    function createDeviceStatus(postData) {

        if (app.nightscoutProxy) { // only proxy incoming data if a downstream Nightscout server has been configured
            app.nightscoutProxy.sendDeviceStatus(postData).then(
                success => log.debug('Successfully sent devicestatus downstream'),
                failure => log.error('Failed to send devicestatus downstream:', failure)
            );
        }

        return dbPUT('device-status', { uploaderBattery: postData.uploaderBattery }, app.currentTime()).then(
            () => log(`Received device status (${postData.uploaderBattery})`),
            err => log.error('Could not create alarm') || Promise.reject(err) // keep the Promise rejected
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

    function saveTestData(name) {
        return app.data.getTimelineContent()
            .then(function(dataSnapshot) {
                let testData = {
                    snapshot: dataSnapshot,
                    name: name || helpers.isoTimestamp(app.currentTime())
                };
                return dbPUT('test-data', testData, app.currentTime()).then(
                    () => log(`Received test data (${testData.name})`),
                    err => log.error('Could not store test data') || Promise.reject(err) // keep the Promise rejected
                );
            });
    }

    function getProfileSettings() {
        return app.pouchDB.allDocs({
                include_docs: true,
                descending: true,
                startkey: 'settings/_',
                endkey: 'settings/',
                limit: 1
            })
            .then(res => res.rows[0] ? res.rows[0].doc : null);
    }

    function legacyPost(data) {
        log.debug('legacyPost()', 'Incoming data:', data);
        return app.pouchDB.get('treatments/' + helpers.isoTimestamp(data.time))
            .catch(() => {
                log.debug('legacyPost()', 'Existing treatment not found with time:', data.time);
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
                return dbPUT('treatments', doc).then(
                    () => log(`Received legacy data`),
                    err => log.error('Could not store legacy data') || Promise.reject(err) // keep the Promise rejected
                );
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
                log(`Returning ${data.length} legacy entries`);
                return data;
            },
            err => {
                log.error('Could not return legacy entries', err);
                return Promise.reject(err);
            }
        );
    }

};
