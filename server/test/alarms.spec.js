import ENTRIES from './alarms.json';
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

    it('works', () => {

        return post('/api/v1/entries', ENTRIES[0])
            .then(() => post('/api/v1/entries', ENTRIES[1]))

            // Should not alarm
            .then(() => post('/api/v1/entries', ENTRIES[2]))
            .then(() => post('/api/v1/entries', ENTRIES[3]))
            .then(() => post('/api/v1/entries', ENTRIES[4]))
            .then(() => setCurrentTime(ENTRIES[4].date + 1000))
            .then(() => app.alarms.runChecks())
            .then(() => get('/api/v1/status'))
            .then(alarms => assertEqual(alarms, []))


            // Should alarm falling
            .then(() => post('/api/v1/entries', ENTRIES[5]))
            .then(() => setCurrentTime(ENTRIES[5].date + 1000))
            .then(() => app.alarms.runChecks())
            .then(() => get('/api/v1/status'))
            .then(alarms => assertEqual(stripMetaFields(alarms), [{
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
            .then(alarms => assertEqual(stripMetaFields(alarms), [{
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
            .then(alarms => assertEqual(alarms, [])) // the HTTP endpoint won't return ack'ed alarms
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
            .then(alarms => assertEqual(alarms, [])) // the HTTP endpoint gives all clear
            .then(() => app.data.getActiveAlarms(true)) // and the internal API likewise
            .then(alarms => assertEqual(alarms, []));
    });

});
