import ENTRIES from './sensor-change.json';
import createAppInstance from '../app/';
import axios from 'axios';
import PouchDB from 'pouchdb';
import MemDOWN from 'memdown';
import { assert } from 'chai';
import _ from 'lodash';
import Logger from '../utils/Logger';
import * as helpers from '../app/helpers';

export function serially(callbacks) {
    return callbacks.reduce((prev, next) => prev.then(next), Promise.resolve());
}

export function assertEqual(actual, expected) {
    return assert.deepEqual(actual, expected);
}

export function stripMetaFields(doc) {
    return _.isArray(doc) ? doc.map(stripMetaFields) : _.omit(doc, '_id', '_rev');
}

export function createTestApp(overrides = {}) {
    let fakeCurrentTime = Date.now(); // any time-sensitive tests will likely want to change this
    const dbName = Date.now() + ''; // even though the in-memory DB's get dumped when the test suite exits, DB's with the same name will SHARE data during runtime
    const app = createAppInstance(_.extend({
        logger: new Logger(false), // no transports enabled
        currentTime: () => fakeCurrentTime,
        pouchDB: new PouchDB(dbName, { db: MemDOWN }), // http://pouchdb.com/adapters.html#pouchdb_in_node_js
        pushover: {
            sendAlarm: () => Promise.resolve('FAKE_PUSHOVER_RECEIPT'),
            ackAlarms: () => Promise.resolve()
        }
    }, overrides));
    let httpHostPrefix;
    app.__test = { // attach some helpful utilities for interacting with the test app we created
        createTestServer() {
            return app.server.createExpressServer()
                .then(randomPort => httpHostPrefix = 'http://localhost:' + randomPort); // expose the OS-assigned random port for the rest of the test suite
        },
        setCurrentTime: newTime => fakeCurrentTime = newTime,
        get: url => axios.get(httpHostPrefix + url).then(res => res.data),
        post: (url, data) => axios.post(httpHostPrefix + url, data).then(res => res.data)
    };
    return app.pouchDB.put(getDefaultSettings()).then(() => app);
}

function getDefaultSettings() {
    return {
        "_id": `settings/${helpers.isoTimestamp(Date.now())}`,
        "alarmsOn": true,
        "profiles": {
            "day": {
                "HIGH_LEVEL_REL": 10,
                "HIGH_LEVEL_ABS": 15,
                "LOW_LEVEL_REL": 9,
                "LOW_LEVEL_ABS": 5,
                "TIME_SINCE_SGV_LIMIT": 1200000,
                "BATTERY_LIMIT": 30,
                "ALARM_RETRY": 120,
                "ALARM_EXPIRE": 1200,
                "alarmSettings": {
                    "outdated": {
                        "levels": [
                            10,
                            20,
                            20
                        ],
                        "snooze": 120
                    },
                    "high": {
                        "levels": [
                            10,
                            20,
                            20
                        ],
                        "snooze": 90
                    },
                    "persistent_high": {
                        "levels": [
                            10,
                            20,
                            20
                        ],
                        "snooze": 90
                    },
                    "low": {
                        "levels": [
                            6,
                            7,
                            10
                        ],
                        "snooze": 15
                    },
                    "rising": {
                        "levels": [
                            8,
                            15,
                            15
                        ],
                        "snooze": 20
                    },
                    "falling": {
                        "levels": [
                            6,
                            7,
                            10
                        ],
                        "snooze": 10
                    },
                    "battery": {
                        "levels": [
                            10,
                            20,
                            20
                        ],
                        "snooze": 60
                    }
                }
            },
            "night": { // identical to "day"
                "HIGH_LEVEL_REL": 10,
                "HIGH_LEVEL_ABS": 15,
                "LOW_LEVEL_REL": 9,
                "LOW_LEVEL_ABS": 5,
                "TIME_SINCE_SGV_LIMIT": 1200000,
                "BATTERY_LIMIT": 30,
                "ALARM_RETRY": 120,
                "ALARM_EXPIRE": 1200,
                "alarmSettings": {
                    "outdated": {
                        "levels": [
                            10,
                            20,
                            20
                        ],
                        "snooze": 120
                    },
                    "high": {
                        "levels": [
                            10,
                            20,
                            20
                        ],
                        "snooze": 90
                    },
                    "persistent_high": {
                        "levels": [
                            10,
                            20,
                            20
                        ],
                        "snooze": 90
                    },
                    "low": {
                        "levels": [
                            6,
                            7,
                            10
                        ],
                        "snooze": 15
                    },
                    "rising": {
                        "levels": [
                            8,
                            15,
                            15
                        ],
                        "snooze": 20
                    },
                    "falling": {
                        "levels": [
                            6,
                            7,
                            10
                        ],
                        "snooze": 10
                    },
                    "battery": {
                        "levels": [
                            10,
                            20,
                            20
                        ],
                        "snooze": 60
                    }
                }
            }
        }
    };
}
