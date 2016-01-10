import ENTRIES from './alarms-falling.json';
import ENTRIES2 from './alarms-low.json';
import ENTRIES3 from './alarms-high.json';
import * as testUtils from './test-utils';

describe('basic alarm checks', () => {

    const { assertEqual, stripMetaFields } = testUtils;
    let app, get, post, setCurrentTime;

    beforeEach(function() {
        app = testUtils.createTestApp();
        setCurrentTime = app.__test.setCurrentTime;
        get = app.__test.get;
        post = app.__test.post;
        return app.__test.createTestServer();
    });


    it('works with FALLING status + ACK + battery alarm', () => {

        return post('/api/v1/entries', ENTRIES[0])
            .then(() => post('/api/v1/entries', ENTRIES[1]))

            // Should not alarm
            .then(() => post('/api/v1/entries', ENTRIES[2]))
            .then(() => post('/api/v1/entries', ENTRIES[3]))
            .then(() => post('/api/v1/entries', ENTRIES[4]))
            .then(() => setCurrentTime(ENTRIES[4].date + 1000))
            .then(() => app.alarms.runChecks())
            .then(() => get('/api/v1/status'))
            .then(status => assertEqual(status.alarms, []))

            // Should alarm falling
            .then(() => post('/api/v1/entries', ENTRIES[5]))
            .then(() => setCurrentTime(ENTRIES[5].date + 1000))
            .then(() => app.alarms.runChecks())
            .then(() => get('/api/v1/status'))
            .then(status => assertEqual(stripMetaFields(status.alarms), [{
                "ack": false,
                "level": 1,
                "status": "active",
                "type": "falling"
            }]))

            // Check that level rises ok
            .then(() => post('/api/v1/entries', ENTRIES[6]))
            .then(() => setCurrentTime(ENTRIES[6].date + 1000))
            .then(() => app.alarms.runChecks())
            .then(() => get('/api/v1/status'))
            .then(status => assertEqual(stripMetaFields(status.alarms), [{
                "ack": false,
                "level": 2,
                "status": "active",
                "type": "falling"
            }]))

            // Acknowledge testing
            .then(() => post('/api/v1/entries', ENTRIES[7]))
            .then(() => setCurrentTime(ENTRIES[7].date + 1000))
            .then(() => post('/api/v1/status')) // ack latest alarm
            .then(() => app.alarms.runChecks())
            .then(() => get('/api/v1/status'))
            .then(status => assertEqual(status.alarms, [])) // the HTTP endpoint won't return ack'ed alarms
            .then(() => app.data.getActiveAlarms(true)) // but the internal API will
            .then(alarms => assertEqual(stripMetaFields(alarms), [{
                "ack": ENTRIES[7].date + 1000,
                "level": 2,
                "status": "active",
                "type": "falling"
            }]))

            // Still snoozing
            .then(() => post('/api/v1/entries', ENTRIES[8]))
            .then(() => setCurrentTime(ENTRIES[8].date + 1000))
            .then(() => app.alarms.runChecks())
            .then(() => app.data.getActiveAlarms(true))
            .then(alarms => assertEqual(stripMetaFields(alarms), [{
                "ack": ENTRIES[7].date + 1000,
                "level": 2,
                "status": "active",
                "type": "falling"
            }]))

            // Alarm cleared
            .then(() => post('/api/v1/entries', ENTRIES[9]))
            .then(() => post('/api/v1/entries', ENTRIES[10]))
            .then(() => setCurrentTime(ENTRIES[10].date + 1000))
            .then(() => app.alarms.runChecks())
            .then(() => get('/api/v1/status'))
            .then(status => assertEqual(status.alarms, [])) // the HTTP endpoint gives all clear
            .then(() => app.data.getActiveAlarms(true)) // and the internal API likewise
            .then(alarms => assertEqual(alarms, []))

            // Uploader battery should alarm if too low
            .then(() => post('/api/v1/devicestatus', { "uploaderBattery": 90 }))
            .then(() => get('/api/v1/status'))
            .then(status => assertEqual(stripMetaFields(status.deviceStatus), { "uploaderBattery": 90 }))
            .then(() => setCurrentTime(ENTRIES[10].date + 2000))
            .then(() => post('/api/v1/devicestatus', { "uploaderBattery": 20 }))
            .then(() => app.alarms.runChecks())
            .then(() => get('/api/v1/status'))
            .then(status => assertEqual(stripMetaFields(status.alarms), [{
                "ack": false,
                "level": 1,
                "status": "active",
                "type": "battery"
            }]))

            // Clear battery alarm
            .then(() => setCurrentTime(ENTRIES[10].date + 3000))
            .then(() => post('/api/v1/devicestatus', { "uploaderBattery": 30 }))
            .then(() => app.alarms.runChecks())
            .then(() => get('/api/v1/status'))
            .then(status => assertEqual(stripMetaFields(status.alarms), []))
    });

    it('works with FALLING + LOW status', () => {

        return post('/api/v1/entries', ENTRIES2[0])

            // Should not alarm
            .then(() => post('/api/v1/entries', ENTRIES2[1]))
            .then(() => post('/api/v1/entries', ENTRIES2[2]))
            .then(() => setCurrentTime(ENTRIES2[2].date + 1000))
            .then(() => app.alarms.runChecks())
            .then(() => get('/api/v1/status'))
            .then(status => assertEqual(status.alarms, []))


            // Should alarm falling
            .then(() => post('/api/v1/entries', ENTRIES2[3]))
            .then(() => post('/api/v1/entries', ENTRIES2[4]))
            .then(() => setCurrentTime(ENTRIES2[4].date + 1000))
            .then(() => app.alarms.runChecks())
            .then(() => get('/api/v1/status'))
            .then(status => assertEqual(stripMetaFields(status.alarms), [{
                "ack": false,
                "level": 1,
                "status": "active",
                "type": "falling"
            }]))

            // Should change to alarm low
            .then(() => post('/api/v1/entries', ENTRIES2[5]))
            .then(() => post('/api/v1/entries', ENTRIES2[6]))
            .then(() => setCurrentTime(ENTRIES2[6].date + 1000))
            .then(() => app.alarms.runChecks())
            .then(() => get('/api/v1/status'))
            .then(status => assertEqual(stripMetaFields(status.alarms), [{
                "ack": false,
                "level": 1,
                "status": "active",
                "type": "low"
            }]))

            // Alarm cleared
            .then(() => post('/api/v1/entries', ENTRIES2[7]))
            .then(() => post('/api/v1/entries', ENTRIES2[8]))
            .then(() => post('/api/v1/entries', ENTRIES2[9]))
            .then(() => post('/api/v1/entries', ENTRIES2[10]))
            .then(() => setCurrentTime(ENTRIES2[10].date + 1000))
            .then(() => app.alarms.runChecks())
            .then(() => get('/api/v1/status'))
            .then(status => assertEqual(status.alarms, [])) // the HTTP endpoint gives all clear
            .then(() => app.data.getActiveAlarms(true)) // and the internal API likewise
            .then(alarms => assertEqual(alarms, []));
    });

    it('works with RISING + HIGH status', () => {

        return post('/api/v1/entries', ENTRIES3[0])

            // Should not alarm
            .then(() => post('/api/v1/entries', ENTRIES3[1]))
            .then(() => post('/api/v1/entries', ENTRIES3[2]))
            .then(() => setCurrentTime(ENTRIES3[2].date + 1000))
            .then(() => app.alarms.runChecks())
            .then(() => get('/api/v1/status'))
            .then(status => assertEqual(status.alarms, []))


            // Should alarm rising
            .then(() => post('/api/v1/entries', ENTRIES3[3]))
            .then(() => setCurrentTime(ENTRIES3[3].date + 1000))
            .then(() => app.alarms.runChecks())
            .then(() => get('/api/v1/status'))
            .then(status => assertEqual(stripMetaFields(status.alarms), [{
                "ack": false,
                "level": 1,
                "status": "active",
                "type": "rising"
            }]))

            //// Should change to alarm high
            .then(() => post('/api/v1/entries', ENTRIES3[4]))
            .then(() => post('/api/v1/entries', ENTRIES3[5]))
            .then(() => post('/api/v1/entries', ENTRIES3[6]))
            .then(() => setCurrentTime(ENTRIES3[6].date + 1000))
            .then(() => app.alarms.runChecks())
            .then(() => get('/api/v1/status'))
            .then(status => assertEqual(stripMetaFields(status.alarms), [{
                "ack": false,
                "level": 1,
                "status": "active",
                "type": "high"
            }]))

            // Alarm cleared
            // TODO: Advance to level 2 and test pushover
            .then(() => post('/api/v1/entries', ENTRIES3[7]))
            .then(() => post('/api/v1/entries', ENTRIES3[8]))
            .then(() => post('/api/v1/entries', ENTRIES3[9]))
            .then(() => post('/api/v1/entries', ENTRIES3[10]))
            .then(() => post('/api/v1/entries', ENTRIES3[11]))
            .then(() => post('/api/v1/entries', ENTRIES3[12]))
            .then(() => post('/api/v1/entries', ENTRIES3[13]))
            .then(() => post('/api/v1/entries', ENTRIES3[14]))
            .then(() => post('/api/v1/entries', ENTRIES3[15]))
            .then(() => setCurrentTime(ENTRIES3[15].date + 1000))
            .then(() => app.alarms.runChecks())
            .then(() => get('/api/v1/status'))
            .then(status => assertEqual(status.alarms, [])) // the HTTP endpoint gives all clear
            .then(() => app.data.getActiveAlarms(true)) // and the internal API likewise
            .then(alarms => assertEqual(alarms, []));
    });
});
