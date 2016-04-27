import ENTRIES from './alarms-falling.json';
import ENTRIES2 from './alarms-low.json';
import ENTRIES3 from './alarms-high.json';
import * as testUtils from './test-utils';
import * as analyser from '../app/analyser';

describe('basic alarm checks', () => {

    const TIME = 1459000000000; // Sat Mar 26 2016 15:46:40 GMT+0200 (EET)
    const ALL_OK = {};

    const { assertEqual, stripMetaFields } = testUtils;
    let app, get, post, setCurrentTime;
    let analysisResult;

    beforeEach(function() {
        return testUtils.createTestApp({
            analyser: {
                analyseData: () => analysisResult,
                getProfile: () => {}
            }
        }).then(newApp => {
            app = newApp;
            setCurrentTime = app.__test.setCurrentTime;
            get = app.__test.get;
            post = app.__test.post;
            setCurrentTime(TIME);
            return app.__test.createTestServer();
        });
    });

    it('does not create alarms when there are no situations', () => {
        analysisResult = ALL_OK;
        return Promise.resolve()
            .then(app.alarms.runChecks)
            .then(() => app.data.getActiveAlarms())
            .then(alarms => assertEqual(alarms, []));
    });

    it('creates an alarm when there is a situation', () => {
        analysisResult = { [analyser.STATUS_HIGH]: true };
        return Promise.resolve()
            .then(app.alarms.runChecks)
            .then(() => app.data.getActiveAlarms())
            .then(alarms => assertEqual(stripMetaFields(alarms), [
                {
                    level: 1,
                    status: 'active',
                    type: analyser.STATUS_HIGH,
                    validAfter: TIME
                }
            ]));
    });

    it('removes the alarm when the situation has passed', () => {
        analysisResult = { [analyser.STATUS_HIGH]: true };
        return Promise.resolve()
            .then(app.alarms.runChecks)
            .then(() => analysisResult = ALL_OK)
            .then(app.alarms.runChecks)
            .then(() => app.data.getActiveAlarms())
            .then(alarms => assertEqual(alarms, []));
    });

    xit('works with FALLING status + ACK + battery alarm', () => {

        return post('/api/v1/entries', ENTRIES[0])
            .then(() => post('/api/v1/entries', ENTRIES[1]))

            // Should not alarm
            .then(() => setCurrentTime(ENTRIES[2].date))
            .then(() => post('/api/v1/entries', ENTRIES[2]))
            .then(() => setCurrentTime(ENTRIES[3].date))
            .then(() => post('/api/v1/entries', ENTRIES[3]))
            .then(() => get('/api/v1/status'))
            .then(status => assertEqual(status.alarms, []))

            // Should alarm falling
            .then(() => setCurrentTime(ENTRIES[4].date))
            .then(() => post('/api/v1/entries', ENTRIES[4]))
            .then(() => app.alarms.runChecks())
            .then(() => get('/api/v1/status'))
            .then(status => assertEqual(stripMetaFields(status.alarms), [{
                "level": 1,
                "status": "active",
                "type": "falling",
                "validAfter": ENTRIES[4].date
            }]))

            // Check that level rises ok
            .then(() => setCurrentTime(ENTRIES[5].date))
            .then(() => post('/api/v1/entries', ENTRIES[5]))
            .then(() => setCurrentTime(ENTRIES[6].date))
            .then(() => post('/api/v1/entries', ENTRIES[6]))
            .then(() => get('/api/v1/status'))
            .then(status => assertEqual(stripMetaFields(status.alarms), [{
                "level": 2,
                "status": "active",
                "type": "falling",
                "validAfter": ENTRIES[4].date,
                "pushoverReceipts": [ "FAKE_PUSHOVER_RECEIPT" ]
            }]))

            // Acknowledge testing
            .then(() => setCurrentTime(ENTRIES[7].date))
            .then(() => post('/api/v1/entries', ENTRIES[7]))
            .then(() => post('/api/v1/status')) // ack latest alarm
            .then(() => app.alarms.runChecks())
            .then(() => get('/api/v1/status'))
            .then(status => assertEqual(status.alarms, [])) // the HTTP endpoint won't return ack'ed alarms
            .then(() => app.data.getActiveAlarms(true)) // but the internal API will
            .then(alarms => assertEqual(stripMetaFields(alarms), [{
                "level": 1, // level is reset by the ack operation
                "status": "active",
                "type": "falling",
                "validAfter": ENTRIES[7].date + 1000 * 60 * 10, // the "falling" alarm type will snooze for 10 min, according to current settings // TODO: Get this from variable
                "pushoverReceipts": []
            }]))

            // Still snoozing
            .then(() => setCurrentTime(ENTRIES[8].date))
            .then(() => post('/api/v1/entries', ENTRIES[8]))
            .then(() => app.data.getActiveAlarms(true))
            .then(alarms => assertEqual(stripMetaFields(alarms), [{
                "level": 1,
                "status": "active",
                "type": "falling",
                "validAfter": ENTRIES[7].date + 1000 * 60 * 10, // see above
                "pushoverReceipts": []
            }]))

            // Alarm cleared
            .then(() => setCurrentTime(ENTRIES[9].date))
            .then(() => post('/api/v1/entries', ENTRIES[9]))
            .then(() => setCurrentTime(ENTRIES[10].date))
            .then(() => post('/api/v1/entries', ENTRIES[10]))
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
                "level": 1,
                "status": "active",
                "type": "battery",
                "validAfter": ENTRIES[10].date + 2000
            }]))

            // Clear battery alarm
            .then(() => setCurrentTime(ENTRIES[10].date + 3000))
            .then(() => post('/api/v1/devicestatus', { "uploaderBattery": 30 }))
            .then(() => app.alarms.runChecks())
            .then(() => get('/api/v1/status'))
            .then(status => assertEqual(stripMetaFields(status.alarms), []))
    });

    xit('works with FALLING + LOW status', () => {

        return post('/api/v1/entries', ENTRIES2[0])

            // Should not alarm
            .then(() => setCurrentTime(ENTRIES2[1].date))
            .then(() => post('/api/v1/entries', ENTRIES2[1]))
            .then(() => setCurrentTime(ENTRIES2[2].date))
            .then(() => post('/api/v1/entries', ENTRIES2[2]))
            .then(() => get('/api/v1/status'))
            .then(status => assertEqual(status.alarms, []))


            // Should alarm falling
            .then(() => setCurrentTime(ENTRIES2[3].date))
            .then(() => post('/api/v1/entries', ENTRIES2[3]))
            .then(() => get('/api/v1/status'))
            /*
            .then(status => assertEqual(stripMetaFields(status.alarms), [{
                "level": 1,
                "status": "active",
                "type": "falling",
                "validAfter": ENTRIES2[3].date
            }]))
            */

            // Should change to alarm low
            .then(() => setCurrentTime(ENTRIES2[4].date))
            .then(() => post('/api/v1/entries', ENTRIES2[4]))
            .then(() => setCurrentTime(ENTRIES2[5].date))
            .then(() => post('/api/v1/entries', ENTRIES2[5]))
            .then(() => get('/api/v1/status'))
            .then(status => assertEqual(stripMetaFields(status.alarms), [{
                "level": 1,
                "status": "active",
                "type": "low",
                "validAfter": ENTRIES2[5].date
            }]))

            //// Alarm cleared
            .then(() => setCurrentTime(ENTRIES2[6].date))
            .then(() => post('/api/v1/entries', ENTRIES2[6]))
            .then(() => setCurrentTime(ENTRIES2[7].date))
            .then(() => post('/api/v1/entries', ENTRIES2[7]))
            .then(() => setCurrentTime(ENTRIES2[8].date))
            .then(() => post('/api/v1/entries', ENTRIES2[8]))
            .then(() => setCurrentTime(ENTRIES2[9].date))
            .then(() => post('/api/v1/entries', ENTRIES2[9]))
            .then(() => setCurrentTime(ENTRIES2[10].date))
            .then(() => post('/api/v1/entries', ENTRIES2[10]))
            .then(() => get('/api/v1/status'))
            .then(status => assertEqual(status.alarms, [])) // the HTTP endpoint gives all clear
            .then(() => app.data.getActiveAlarms(true)) // and the internal API likewise
            .then(alarms => assertEqual(alarms, []));
    });

    xit('works with RISING + HIGH status', () => {

        return post('/api/v1/entries', ENTRIES3[0])

            // Should not alarm
            .then(() => setCurrentTime(ENTRIES3[1].date))
            .then(() => post('/api/v1/entries', ENTRIES3[1]))
            .then(() => setCurrentTime(ENTRIES3[2].date))
            .then(() => post('/api/v1/entries', ENTRIES3[2]))
            .then(() => app.alarms.runChecks())
            .then(() => get('/api/v1/status'))
            .then(status => assertEqual(status.alarms, []))


            // Should alarm rising
            .then(() => setCurrentTime(ENTRIES3[3].date))
            .then(() => post('/api/v1/entries', ENTRIES3[3]))
            .then(() => app.alarms.runChecks())
            .then(() => get('/api/v1/status'))
            .then(status => assertEqual(stripMetaFields(status.alarms), [{
                "level": 1,
                "status": "active",
                "type": "rising",
                "validAfter": ENTRIES3[3].date
            }]))

            //// Should change to alarm high
            .then(() => setCurrentTime(ENTRIES3[4].date))
            .then(() => post('/api/v1/entries', ENTRIES3[4]))
            .then(() => setCurrentTime(ENTRIES3[5].date))
            .then(() => post('/api/v1/entries', ENTRIES3[5]))
            .then(() => setCurrentTime(ENTRIES3[6].date))
            .then(() => post('/api/v1/entries', ENTRIES3[6]))
            .then(() => get('/api/v1/status'))
            .then(status => assertEqual(stripMetaFields(status.alarms), [{
                "level": 1,
                "status": "active",
                "type": "high",
                "validAfter": ENTRIES3[6].date
            }]))

            // Alarm cleared
            // TODO: Advance to level 2 and test pushover
            .then(() => setCurrentTime(ENTRIES3[7].date))
            .then(() => post('/api/v1/entries', ENTRIES3[7]))
            .then(() => setCurrentTime(ENTRIES3[8].date))
            .then(() => post('/api/v1/entries', ENTRIES3[8]))
            .then(() => setCurrentTime(ENTRIES3[9].date))
            .then(() => post('/api/v1/entries', ENTRIES3[9]))
            .then(() => setCurrentTime(ENTRIES3[10].date))
            .then(() => post('/api/v1/entries', ENTRIES3[10]))
            .then(() => setCurrentTime(ENTRIES3[11].date))
            .then(() => post('/api/v1/entries', ENTRIES3[11]))
            .then(() => setCurrentTime(ENTRIES3[12].date))
            .then(() => post('/api/v1/entries', ENTRIES3[12]))
            .then(() => setCurrentTime(ENTRIES3[13].date))
            .then(() => post('/api/v1/entries', ENTRIES3[13]))
            .then(() => setCurrentTime(ENTRIES3[14].date))
            .then(() => post('/api/v1/entries', ENTRIES3[14]))
            .then(() => setCurrentTime(ENTRIES3[15].date))
            .then(() => post('/api/v1/entries', ENTRIES3[15]))
            .then(() => app.alarms.runChecks())
            .then(() => get('/api/v1/status'))
            .then(status => assertEqual(status.alarms, [])) // the HTTP endpoint gives all clear
            .then(() => app.data.getActiveAlarms(true)) // and the internal API likewise
            .then(alarms => assertEqual(alarms, []));
    });
});
